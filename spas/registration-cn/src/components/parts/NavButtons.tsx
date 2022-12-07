import React, {useState, useEffect, useMemo, useRef} from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useActions } from "../../hooks/useActions";
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActiveSteps } from '../../hooks/useActiveSteps';
import { FormValues } from '../../types/FormValues';
import { validationMessages } from '../../validations/messages';
import { prepareDataToSubmit } from '../../utils/dataProcess';
import { submitData } from '../../utils/regApi';

const NavButtons = () => {
  const timerRef = useRef(null);
  const { currentStep } = useTypedSelector(state => state.step);
  const { forceUseCnNamesSwitch, jointForceUseCnNamesSwitch, useSumsub, useEmailValidation, usePhoneValidation, emailVerifiedStatus, jointEmailVerifiedStatus, phoneVerifiedStatus, jointPhoneVerifiedStatus, sumsubVerifiedStatus, jointSumsubVerifiedStatus, showAutoAddress, jointShowAutoAddress } = useTypedSelector(state => state.app);
  const activeSteps = useActiveSteps();
  const { goToStep, updateModalData } = useActions();
  const [ validating, setValidating ] = useState(false);

  const { t } = useTranslation();

  const { values: formValues, errors: formErrors, validateForm, setFieldError, setFieldTouched, submitForm } = useFormikContext<FormValues>();

  const mustPassSumsub = useMemo(() => (
    useSumsub ? formValues.reg_type !== 'corporate' && forceUseCnNamesSwitch : false
  ), [useSumsub, forceUseCnNamesSwitch, formValues.reg_type])

  const jointMustPassSumsub = useMemo(() => (
    useSumsub ? formValues.reg_type !== 'corporate' && jointForceUseCnNamesSwitch : false
  ), [useSumsub, jointForceUseCnNamesSwitch, formValues.reg_type])

  useEffect(() => {
    return (() => {
        if (timerRef.current) clearTimeout(timerRef.current);
      })
  }, [])

  const moveStep = async (direction: string) => {
    if (direction === 'back') {
      if (currentStep === 1) return;
      goToStep(currentStep - 1);
    } else if (direction === 'next') {
      setValidating(true);

      let hasError = false;

      // Let formik do overall validation first
      const res = await validateForm();
      const fields = Object.keys(res);
      if (fields.length > 0) {
        hasError = true;
        fields.forEach(field => {
          setFieldTouched(field, true, false);
        })
      }      

      // Step 1
      if (activeSteps[currentStep - 1].id === 1) {
        // Verify email'
        if (useEmailValidation) {
          if (!emailVerifiedStatus) {
            hasError = true;
            setFieldTouched('email', true, false);
            setFieldError('email', validationMessages.string.notVerified);
          }
        }

        // Verify mobile phone
        if (usePhoneValidation) {
          if (!phoneVerifiedStatus) {
            hasError = true;
            setFieldTouched('phone', true, false);
            setFieldError('phone', validationMessages.string.notVerified);
          }
        }
      }
      
      // Step 2
      if (activeSteps[currentStep - 1].id === 2) {
        // Check if Sumsub verified
        if (mustPassSumsub && !sumsubVerifiedStatus) {
          hasError = true;
          updateModalData({
            type: 'info',
            title: t("modal_title_error"),
            content: t("sumsub_not_verified_message")
          });
        }

        // Check all address fields
        if (showAutoAddress && formValues['auto_address']) {
          if (!formValues['address'] || !formValues['city'] || !formValues['state'] || !formValues['zip_code']) {
            hasError = true;
            setFieldTouched('auto_address', true, false);
            setFieldError('auto_address', validationMessages.custom.cantFindAddress);            
          }
        }
      }

      // Step 6
      if (activeSteps[currentStep - 1].id === 6) {
        // Verify joint email
        if (useEmailValidation) {
          if (!jointEmailVerifiedStatus) {
            hasError = true;
            setFieldTouched('joint_email', true, false);
            setFieldError('joint_email', validationMessages.string.notVerified);
          }
        }

        // Verify joint mobile phone
        if (usePhoneValidation) {
          if (!jointPhoneVerifiedStatus) {
            hasError = true;
            setFieldTouched('joint_phone', true, false);
            setFieldError('joint_phone', validationMessages.string.notVerified);
          }   
        }

        // Check if Sumsub verified
        if (jointMustPassSumsub && !jointSumsubVerifiedStatus) {
          hasError = true;
          updateModalData({
            type: 'info',
            title: t("modal_title_error"),
            content: t("sumsub_not_verified_message")
          });
        }

        // Check all joint address fields
        if (jointShowAutoAddress && formValues['joint_auto_address']) {
          if (!formValues['joint_address'] || !formValues['joint_city'] || !formValues['joint_state'] || !formValues['joint_zip_code']) {
            hasError = true;
            setFieldTouched('joint_auto_address', true, false);
            setFieldError('joint_auto_address', validationMessages.custom.cantFindAddress);            
          }
        }        
      }

      if (hasError) return setValidating(false);

      // Submit Simple Lead
      if (activeSteps[currentStep - 1].id === 1) {
        await submitData(prepareDataToSubmit(formValues, 'simple'));
      } 

      // If move to the next step too fast Formik could even have the next step validated, so set a delay here
      timerRef.current = setTimeout(() => {
        setValidating(false);
        goToStep(currentStep + 1);
      }, 1000)
    }
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();

    const res = await validateForm();
    const fields = Object.keys(res);
    if (fields.length > 0) {
      fields.forEach(field => {
        setFieldTouched(field, true, true);
      })

      return;
    }

    submitForm();
  }

  return (
    <div className="el_wrap next_btn">
        {
          currentStep !== 1 && <button type="button" className="btn step-back" onClick={() => moveStep('back')}>{t("nav_button_prev_text")}</button>
        }
        {
            currentStep !== activeSteps.length ? 
              <button type="button" className={`btn icm-btn-primary step-next ${validating ? 'waiting' : ''}`} onClick={() => moveStep('next')} disabled={validating ? true : false}>{t("nav_button_next_text")}</button> : <button type="submit" className="btn icm-btn-primary step-submit" onClick={handleSubmit}>{t("nav_button_submit_text")}</button>
        }
    </div>
  )
}

export default NavButtons