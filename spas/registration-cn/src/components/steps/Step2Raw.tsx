import React, { useState, useEffect, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import SumsubWebSdk from '@sumsub/websdk-react';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import DateSelect from '../form-controls/DateSelect';
import Input from '../form-controls/Input';
import AutoAddress from '../form-controls/AutoAddress';
import Loader from '../parts/Loader';
import { FormValues } from '../../types/FormValues';
import { getSumsubCredential, getSumsubUserData } from '../../utils/regApi';
import { convertDateFormat } from '../../utils/dataProcess';

interface Step2RawProps {
    stepType: 'individual' | 'joint'
}

const Step2Raw: React.FC<Step2RawProps> = ({stepType}) => {
    const { useSumsub, forceUseCnNamesSwitch, jointForceUseCnNamesSwitch, sumsubCredential, jointSumsubCredential, sumsubVerifiedStatus, jointSumsubVerifiedStatus} = useTypedSelector(state => state.app);
    const { updateSumsubCredential, updateSumsubVerifiedStatus, updateShowAutoAddressStatus, updateModalData } = useActions();
    const [ autoAddressCountry, setAutoAddressCountry ] = useState(null);

    const { values: formValues, setFieldValue } = useFormikContext<FormValues>();    

    const { t } = useTranslation();

    const prefix = stepType === 'joint' ? 'joint_' : '';

    const currentSumsubCredential = useMemo(() => {
        return stepType === 'individual' ? sumsubCredential : jointSumsubCredential
    }, [stepType, sumsubCredential, jointSumsubCredential])
    
    useEffect(() => {
        setAutoAddressCountry(formValues[`${prefix}country` as keyof FormValues] || 'China');
        if (stepType === 'individual' && forceUseCnNamesSwitch && !sumsubVerifiedStatus || 
            stepType === 'joint' && jointForceUseCnNamesSwitch && !jointSumsubVerifiedStatus
        ) {
            prepareSumsubCredential();
        }
    }, [])

    const prepareSumsubCredential = async () => {
        const res = await getSumsubCredential();
        if (res) {
            updateSumsubCredential(res, stepType);
        }

        updateSumsubVerifiedStatus(false, stepType);
    }

    const resetSumsub = async () => {
        updateSumsubCredential(null, stepType);

        await prepareSumsubCredential();
    
        setFieldValue(`${prefix}birth_year`, '');
        setFieldValue(`${prefix}birth_month`, '');
        setFieldValue(`${prefix}birth_day`, '');
        setFieldValue(`${prefix}nationalId`, '');
        setFieldValue(`${prefix}passport`, '');
        setFieldValue(`${prefix}driverLicence`, '');        
        setFieldValue(`${prefix}nationalIdExpiryDate`, '');
        setFieldValue(`${prefix}passportExpiryDate`, '');
        setFieldValue(`${prefix}driverLicenceExpiryDate`, '');   
    }

    const accessTokenExpirationHandler = async () => {
        await resetSumsub();
    }

    const errorHandler = (error: any) => {
        console.log(error);
    }

    const sumsubMessageHandler = async (message: any, payload: any) => {
        switch (message) {
            case 'idCheck.applicantStatus':
                if (payload.reviewStatus !== 'completed') return;
                if (payload.reviewResult.reviewAnswer === 'RED') return;

                const res = await getSumsubUserData(currentSumsubCredential.userId);

                if (!res) {
                    updateModalData({
                        type: 'info',
                        title: t("modal_title_error"),
                        content: t("sumsub_no_data_message")
                    });
                    return await resetSumsub();
                } 

                if (!res.dob) {
                    updateModalData({
                        type: 'info',
                        title: t("modal_title_error"),
                        content: t("sumsub_no_dob_message")
                    });
                    return await resetSumsub();
                }
                
                const date = res.dob.split('-');
                if (!date[0] || !date[1] || !date[2]) {
                    updateModalData({
                        type: 'info',
                        title: t("modal_title_error"),
                        content: t("sumsub_no_dob_message")
                    });
                    return await resetSumsub(); 
                }
                    
                const currentYear = new Date().getFullYear();

                if (currentYear - date[0] < 18 || currentYear - date[0] > 90) {
                    updateModalData({
                        type: 'info',
                        title: t("modal_title_error"),
                        content: t("sumsub_age_error_message")
                    });
                    return await resetSumsub();
                } 

                setFieldValue(`${prefix}birth_year`, date[0]);
                setFieldValue(`${prefix}birth_month`, date[1]);
                setFieldValue(`${prefix}birth_day`, date[2]);

                // Check if valid doc number and expiry date returned from Sumsub
                if (!res.idDocs || res.idDocs.length === 0) {
                    updateModalData({
                        type: 'info',
                        title: t("modal_title_error"),
                        content: t("sumsub_no_valid_doc_message")
                    });
                    return await resetSumsub();                  
                }

                let hasValidDoc = false;
                res.idDocs.forEach((doc: any) => {
                    if (!doc.number || !doc.idDocType) return;

                    hasValidDoc = true;

                    switch(doc.idDocType) {
                        case 'ID_CARD':
                            setFieldValue(`${prefix}nationalId`, doc.number);
                            setFieldValue(`${prefix}nationalIdExpiryDate`, convertDateFormat(doc.validUntil));
                            break;
                        case 'PASSPORT':
                            setFieldValue(`${prefix}passport`, doc.number);
                            setFieldValue(`${prefix}passportExpiryDate`, convertDateFormat(doc.validUntil));
                            break;
                        case 'DRIVERS':
                            setFieldValue(`${prefix}driverLicence`, doc.number);
                            setFieldValue(`${prefix}driverLicenceExpiryDate`, convertDateFormat(doc.validUntil));
                            break;
                        default:
                    }
                })

                if (!hasValidDoc) {
                    updateModalData({
                        type: 'info',
                        title: t("modal_title_error"),
                        content: t("sumsub_no_valid_doc_message")
                    });
                    return await resetSumsub();       
                }

                // No error, then set sumsubVerifiedStatus to true
                updateSumsubVerifiedStatus(true, stepType);

                break;
            default:
        }
    }

    const handleAddressModeChange = (autoMode: boolean) => {
        updateShowAutoAddressStatus(autoMode, stepType);
    }

    return (
        <>
            {               
                useSumsub && (stepType === 'individual' && forceUseCnNamesSwitch || stepType === 'joint' && jointForceUseCnNamesSwitch) ? 
                    <div className='input_group sumsub'>
                        {
                            !currentSumsubCredential ? 
                            <Loader size="small" />
                            :
                            <SumsubWebSdk
                            accessToken={currentSumsubCredential.token}
                            expirationHandler={accessTokenExpirationHandler}
                            config={{
                                lang: 'zh',
                                uiConf: {
                                    // customCss: `${window.location.protocol}//${window.location.host}/regspa-cn/sumsub.css?ver=${Date.now()}`
                                    customCssStr: "* {font-family: 'Roboto', sans-serif !important;} .iframe2 {min-height: unset !important;}"
                                }
                            }}
                            onError={errorHandler}
                            onMessage={sumsubMessageHandler}
                            />
                        }
                    </div>    
                    : 
                    <div className="input_group">
                        <DateSelect label={t('birth_label')} name={`${prefix}birth`} />
                    </div>
            }
            <div className="input_group">
                <AutoAddress name={prefix} country={autoAddressCountry} mode={window['currentLocale'] === 'cn' ? 'manual' : 'auto'} onModeChange={handleAddressModeChange} />
            </div>
            {
                autoAddressCountry == "China" && 
                <div className="input_group">
                    <Input type="text" label={t('qq_id_label')} name={`${prefix}qq_id`} />
                </div>                    
            }                            
        </>
    )
}

export default Step2Raw