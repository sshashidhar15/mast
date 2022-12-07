import React, { useState, useEffect, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { RegTypes } from '../../types/FormControls';
import SelectButtons from '../form-controls/SelectButtons';
import DateSelect from '../form-controls/DateSelect';
import Input from '../form-controls/Input';
import Checkbox from '../form-controls/Checkbox';
import DropdownSelect from '../form-controls/DropdownSelect';
import { AccountType } from '../../types/App';
import { SelectItem  } from '../../types/FormControls';
import { sortCountries } from '../../utils/dataProcess';
import { FormValues } from '../../types/FormValues';
import { BranchId } from '../../types/FeedData';
import Step2Raw from './Step2Raw';
import Reffer from '../form-controls/Reffer';
import { scrollToTop } from '../../utils/ui';

const Step2 = () => {
    const form = useTypedSelector(state => state.form);
    const { data } = useTypedSelector(state => state.feed);
    const { branchId, accountType } = useTypedSelector(state => state.app);
    const { changeAccountType } = useActions();
    const [ countries, setCountries ] = useState<SelectItem[]>([]);
    const [ signatoryCountry, setSignatoryCountry ] = useState(null);
    const [ phone, setPhone ] = useState(null);
    const [ registeredCountry, setRegisteredCountry ] = useState(null);
    const [ businessCountry, setBusinessCountry ] = useState(null);

    const { values: formValues, setFieldValue } = useFormikContext<FormValues>();    

    const { t } = useTranslation();

    const allowedIslamic = useMemo(() => {
        const countryObj = data.countries.filter(c => c.name === form.values.country);
        if (countryObj.length > 0) {
            const branching = countryObj[0].branching.filter(b => b.branch === branchId);
            if (branching.length > 0) {
                return branching[0].islamic === true;
            }
        }
        return false;
    }, [data, form.values.country])

    useEffect(() => {
        const result = sortCountries(data.countries).filter(c => c.value = 'China')[0];
        result['label'] = window['currentLocale'] === 'cn' ? '中国' : 'China';
        setCountries([result]);

        setSignatoryCountry(form.values.country2 || form.values.country || 'China');
        setRegisteredCountry(form.values.registered_country || form.values.country || 'China');
        setBusinessCountry(form.values.business_country || form.values.country || 'China');

        scrollToTop();
    }, [])

    const handleRegTypeChange = (name: string, val: string) => {
        changeAccountType(AccountType[val as keyof typeof AccountType]);
    }

    const handleCountryChange = (name: string, val: string) => {
        if (val !== form.values[name as keyof typeof form.values]) {
            let result = data.countries.filter(c => c.name === val);

            if (result && result.length > 0) {
                setPhone(result[0].tel);
            }
        }
    }

    const handleSameAddress = (name: string, val: string) => {
        if (val === 'off') return;

        setFieldValue('business_country', form.values.registered_country);
        setFieldValue('business_street_number', form.values.registered_street_number);
        setFieldValue('business_street', form.values.registered_street);
        setFieldValue('business_city', form.values.registered_city);
        setFieldValue('business_state', form.values.registered_state);
        setFieldValue('business_zip_code', form.values.registered_zip_code);
    }

    const handleRegisteredAddressChange = (name: string, val: string) => {
        if (form.values.busaddr === 'off') return;

        const targetName = name.replace('registered', 'business');
        setFieldValue(targetName, val);
    }

    return (
        <div className="register_form step2">
          <h1 className="reg_title">{t("step2_heading_live")}</h1>
          <div className="row">
            <div className="col-md-12">
                <div className='input_group'>
                    <SelectButtons label={t("reg_type_label")} name="reg_type" options={RegTypes}  size="small" type="normal" onChange={handleRegTypeChange} />
                </div>
                {
                    accountType === AccountType['individual'] && allowedIslamic && 
                    <div className='input_group'>
                        <Checkbox name="islamic" label={t("islamic_label")} />
                    </div>    
                }
                {
                    accountType !== AccountType['corporate'] ? (
                        <Step2Raw stepType='individual' />
                    ) : (
                        <>
                            <div className="section_title">
                                <h3>{t("signatory_information_title")}</h3>
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("last_name2_label")} name="last_name2" />
                            </div>                            
                            <div className='input_group'>
                                <Input type="text" label={t("first_name2_label")} name="first_name2" />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("email2_label")} name="email2" />
                            </div>
                            <div className="input_group">
                                <Input type="text" label={t("phone2_label")} name="phone2" setValue={phone} />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("city2_label")} name="city2" />
                            </div>
                            <div className="input_group">
                                <DropdownSelect label={t("country2_label")} placeholder={t("country2_placeholder")} name="country2" allowInput={true} items={countries} setValue={signatoryCountry} onChange={handleCountryChange} prefix="reg_form_country_" maxHeight={400} />
                            </div>     
                            <div className="input_group">
                                <DateSelect label={t("signatory_birth_label")} name="signatory_birth" />
                            </div>
                            {
                                formValues['country2'] == "China" && 
                                <div className="input_group">
                                    <Input type="text" label={t('qq_id_label')} name='qq_id_corporate' />
                                </div>                    
                            }                            
                            <div className="section_title">
                                <h3>{t("company_information_title")}</h3>
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("company_name_label")} name="company_name" />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("legal_entity_id_label")} name="legal_entity_id" />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("place_incorporation_label")} name="place_incorporation" />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("fax_label")} name="fax" setValue={phone} />
                            </div>
                            <div className="input_group">
                                <DateSelect label={t("incorporation_birth_label")} name="incorporation_birth" />
                            </div>
                            <div className="section_title">
                                <h3>{t("registered_address_title")}</h3>
                            </div>
                            <div className="input_group">
                                <DropdownSelect label={t("registered_country_label")} placeholder={t("registered_country_placeholder")} name="registered_country" allowInput={true} items={countries} setValue={registeredCountry} prefix="reg_form_country_" maxHeight={400} onBlur={handleRegisteredAddressChange} />
                            </div>                            
                            <div className='input_group'>
                                <Input type="text" label={t("registered_street_number_label")} name="registered_street_number" onBlur={handleRegisteredAddressChange} />
                            </div>                               
                            <div className='input_group'>
                                <Input type="text" label={t("registered_street_label")}  name="registered_street" onBlur={handleRegisteredAddressChange} />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("registered_city_label")}  name="registered_city" onBlur={handleRegisteredAddressChange} />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("registered_state_label")}  name="registered_state" onBlur={handleRegisteredAddressChange} />
                            </div>
                            <div className='input_group'>
                                <Input type="text" label={t("registered_zip_code_label")} name="registered_zip_code" onBlur={handleRegisteredAddressChange} />
                            </div>
                            <div className="section_title">
                                <h3>{t("business_address_title")}</h3>
                            </div>
                            <div className='input_group'>
                                <Checkbox name="busaddr" label={t("busaddr_label")} onChange={handleSameAddress} />
                            </div>
                            {
                                form.values.busaddr === 'off' && (
                                    <>
                                        <div className="input_group">
                                            <DropdownSelect label={t("business_country_label")} placeholder={t("business_country_placeholder")} name="business_country" allowInput={true} items={countries} setValue={businessCountry} prefix="reg_form_country_" maxHeight={400} />
                                        </div>                            
                                        <div className='input_group'>
                                            <Input type="text" label={t("business_street_number_label")} name="business_street_number" />
                                        </div>                               
                                        <div className='input_group'>
                                            <Input type="text" label={t("business_street_label")} name="business_street" />
                                        </div>
                                        <div className='input_group'>
                                            <Input type="text" label={t("business_city_label")} name="business_city" />
                                        </div>
                                        <div className='input_group'>
                                            <Input type="text" label={t("business_state_label")} name="business_state" />
                                        </div>
                                        <div className='input_group'>
                                            <Input type="text" label={t("business_zip_code_label")} name="business_zip_code" />
                                        </div>
                                    </>
                                )
                            }
                        </>
                    )
                }
                { branchId === BranchId.fsa && <Reffer stepType='individual' /> }
            </div>
          </div>
        </div>
      )
}

export default Step2