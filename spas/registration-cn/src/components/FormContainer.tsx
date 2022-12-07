import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { cloneDeep } from 'lodash';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { initialFormValues, FormValues } from '../types/FormValues';
import FormikWrap from './FormikWrap';
import StepWrap from './StepWrap';
import NavButtons from './parts/NavButtons';
import Loader from './parts/Loader';
import { getValidationSchema } from '../validations/schemas';
import { useActiveSteps } from '../hooks/useActiveSteps';
import { submitData } from '../utils/regApi';
import { useActions } from '../hooks/useActions';
import { t } from 'i18next';
import { prepareDataToSubmit } from '../utils/dataProcess';

const FormContainer = () => {
  const { loading, data } = useTypedSelector( state => state.feed )
  const { accountType, forceUseCnNamesSwitch, jointForceUseCnNamesSwitch, showAutoAddress, jointShowAutoAddress } = useTypedSelector(state => state.app);
  const { currentStep } = useTypedSelector(state => state.step);
  const activeSteps = useActiveSteps();
  const { updateModalData, setShowRegOverlay } = useActions();
  
  const validationSchema = useMemo(() => {
    const steps: number[] = [];

    for (let i = 1; i <= currentStep; i++) {
      steps.push(activeSteps[i - 1].id);
    }

    return Yup.object().shape(getValidationSchema(window['currentBranchID'], steps, accountType,  forceUseCnNamesSwitch, jointForceUseCnNamesSwitch, showAutoAddress, jointShowAutoAddress));
  }, [currentStep, accountType, forceUseCnNamesSwitch, jointForceUseCnNamesSwitch, showAutoAddress, jointShowAutoAddress]);

  const submitForm = async (values: FormValues) => {
    setShowRegOverlay(true);

    const dataToSubmit = prepareDataToSubmit(values);
    dataToSubmit['truliooVerificationFields'] = 'undefined';
    dataToSubmit['joint_truliooVerificationFields'] = 'undefined';
    const res = await submitData(dataToSubmit);

    if (res.status === 'error') {
      setShowRegOverlay(false);

      const visitor_tracking = localStorage.getItem('visitor-tracking');
      const tracking_info = visitor_tracking ? JSON.parse(visitor_tracking) : [];
      tracking_info.push(`ERROR registration as [${values.reg_type}] with email [${values.email}] at [${new Date().toLocaleString()}]`);
      localStorage.setItem('visitor-tracking', JSON.stringify(tracking_info));

      // res.error might be a encoded json but may not so need to try parsing
      try {
        const errorResult = JSON.parse(res.error);

        let errorMessage = '';
  
        if (Array.isArray(errorResult)) {
          errorResult.forEach(r => {
            if (t(`error.${r.Code}`) !== `error.${r.Code}`) {
              errorMessage += t(`error.${r.Code}`) + '<br />'
            } else {
              errorMessage += r.ErrorMessage + '<br />'
            }
          })
        } else {
          if (t(`error.${errorResult.Code}`) !== `error.${errorResult.Code}`) {
            errorMessage += t(`error.${errorResult.Code}`) + '<br />'
          } else {
            errorMessage += errorResult.ErrorMessage + '<br />'
          }          
        }

        return updateModalData({
          type: 'info',
          title: t("modal_title_error"),
          content: errorMessage
        });        
      } catch (err) {
        return updateModalData({
          type: 'info',
          title: t("modal_title_error"),
          content: res.error
        });
      }
    }

    if (res.status === 'success') {
      localStorage.setItem('visitor-tracking', JSON.stringify([`registered before as [${values.reg_type}] with email [${values.email}] at [${new Date().toLocaleString()}]`]));

      let redirectionUrl = res.link || res.url;

      // Add regok param in the redirection url for use in CA
      if (redirectionUrl.includes('?')) {
        if (!redirectionUrl.includes('regok')) {
          redirectionUrl += '&regok=regok';
        }
      } else {
        redirectionUrl += '?regok=regok';
      }

      if (values.reg_type === 'joint') {
        setShowRegOverlay(false);
        
        return updateModalData({
          type: 'info',
          title: t("reg_form_live_congratulations"),
          content: t("reg_form_live_explain"),
          buttonText: t("reg_form_live_sign_into_ca"),
          buttonLink: redirectionUrl
        });
      }

      window.location.href = redirectionUrl;
    }
  }

  return (
    <div className='register_form_wrap'>
      { loading && <Loader size="large" /> }
      { !loading && data && 
        <div className="containers-wrap">
          <FormikWrap
            initialValues={cloneDeep(initialFormValues)}
            validationSchema={validationSchema}
            onSubmit={submitForm}
          >
            <StepWrap />
            <NavButtons />
          </FormikWrap>
          <div className="encrypt">Data Encrypted &amp; Secured</div> 
        </div>
      }
    </div>
  )
}

export default FormContainer;