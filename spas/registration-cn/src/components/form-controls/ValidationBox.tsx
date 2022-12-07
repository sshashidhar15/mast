import React, {useState, useEffect, useRef} from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormValues } from '../../types/FormValues';
import { checkEmailAvailable } from '../../validations/rules';
import { validationMessages } from '../../validations/messages';
import { createEmailCode, createMobileCode, verifyEmailCode, verifyMobileCode } from '../../utils/regApi';

interface ValidationBoxProps {
    name: string,
    type: string,
    label?: string,
    placeholder?: string,
    prefix?: string,
    setValue?: string | null,
    onChange?: (name: string, val: string) => void,
    onBlur?: (name: string, val: string) => void,
    onVerify?: (verified: boolean, type: string) => void
}

const ValidationBox: React.FC<ValidationBoxProps> = (props) => {
    const inputRef = useRef(null);
    const {label, type, name, placeholder, prefix, setValue, onChange: onValueChange, onBlur: onElementBlur, onVerify} = props;
    const [inputValue, setInputValue] = useState<string>('');
    const [codeValue, setCodeValue] = useState<string>('');
    const [focusState, setFocusState] = useState(false);
    const [valueState, setValueState] = useState(false);
    const [validationClass, setValidationClass] = useState('');
    const [status, setStatus] = useState<'initial' | 'codeSent'| 'verified'>('initial');
    const [countdownSeconds, setCountcownSeconds] = useState(0);
    const [codeFailureMessage, setCodeFailureMessage] = useState('');
    const [waiting, setWaiting] = useState(false);

    const { values: formValues, errors, touched, handleChange, handleBlur, setFieldValue, setFieldError, setFieldTouched } = useFormikContext<FormValues>(); 

    const { t } = useTranslation();

    useEffect(() => {
      if(formValues[name as keyof FormValues]) {
          setInputValue(formValues[name as keyof FormValues]);
          setFieldTouched(name, false, false);
          setValidationClass('');
          setStatus('verified');
      }
    }, [])

    useEffect(() => {
      if (setValue === undefined || setValue === null) return;
      if (setValue === inputValue) return;

      setInputValue(setValue);
      setFieldValue(name, setValue);
      setFieldTouched(name, false, false);
      setValidationClass('');
    }, [setValue])

    useEffect(() => {
      if (prefix === undefined || prefix === null) return;
      if (prefix === inputValue) return;
      if (setValue) return;

      setInputValue(prefix);
      setFieldValue(name, prefix);
      setFieldTouched(name, false, false);
      setValidationClass('');
    }, [prefix, setValue])

    useEffect(() => {
      if (touched[name as keyof typeof touched]) {
          if (errors[name as keyof typeof errors]) {
              setValidationClass('error');
          }
        }
    }, [errors, touched])

    useEffect(() => {
      if (inputValue) {
          setValueState(true);
      } else {
          setValueState(false);
      }
    }, [inputValue])    

    useEffect(() => {
      if (!errors[name as keyof typeof errors]) setValidationClass('');
    }, [errors])       
    
    useEffect(() => {
      if (countdownSeconds === 0) return;

      let timer = setTimeout(() => {
        setCountcownSeconds(countdownSeconds - 1);
      }, 1000);

      return (() => {
        clearTimeout(timer);
      })
    }, [countdownSeconds])

    useEffect(() => {
      let timer: any = null;

      if (codeFailureMessage) {
        timer = setTimeout(() => {
          setCodeFailureMessage('');
        }, 3000)              
      }

      return (() => {
        if (timer !== null) clearTimeout(timer);
      })
    }, [codeFailureMessage])

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e);
      setInputValue(e.target.value);
      if(onValueChange) onValueChange(name, e.target.value);
    }

    const doEmailChecking = async (email: string, individualEmail?: string) => {
      if (individualEmail && individualEmail === email) return false;

      return await checkEmailAvailable(email);
    }  

    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setFocusState(true)
    }

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        handleBlur(e);

        setFocusState(false)
        if(onElementBlur) onElementBlur(name, e.target.value);
    }

    const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e);
      setCodeValue(e.target.value);
    }

    const getCode = async (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      setFieldTouched(name, true, false);

      if (waiting || !inputValue) return;

      // still allow getting code when custom errors exist
      if (type === 'email') {
        if (errors[name as keyof typeof errors] && errors[name as keyof typeof errors] !== validationMessages.string.emailUsed && errors[name as keyof typeof errors] !== validationMessages.string.failToVerify && errors[name as keyof typeof errors] !== validationMessages.string.notVerified) return;
      } else {
        if (errors[name as keyof typeof errors] && errors[name as keyof typeof errors] !== validationMessages.string.failToVerify && errors[name as keyof typeof errors] !== validationMessages.string.notVerified) return;
      }
      
      setWaiting(true);

      if (type === 'email') {
        let available: boolean;
        if (name.includes('joint_')) available = await doEmailChecking(inputValue, formValues.email);
        else available = await doEmailChecking(inputValue);

        if (!available) {
          setFieldTouched(name, true, false);
          setFieldError(name, validationMessages.string.emailUsed);          
          setWaiting(false);
          return;
        }
      }

      let res: any;
      if (type === 'email') {
        res = await createEmailCode(inputValue, window['currentLocale'] === 'cn' ? 'cn' : 'en');
      } 
      if (type === 'phone') {
        res = await createMobileCode(inputValue, window['currentLocale'] === 'cn' ? 'cn' : 'en');
      }

      if (res && res.result && res.result === 'success') {
        setStatus('codeSent');
        setCountcownSeconds(30);
      } else {
        setCodeFailureMessage(t("validation_code_failure_message"));
      }
      
      setWaiting(false);
    }

    const verifyCode = async (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      if (waiting) return;

      if (!inputValue || !codeValue) return;

      setWaiting(true);

      let res: any;
      if (type === 'email') {
        res = await verifyEmailCode(inputValue, codeValue);
      }
      if (type === 'phone') {
        res = await verifyMobileCode(inputValue, codeValue);
      }

      setFieldTouched(name, true, false);     

      if (res && res.result && res.result === 'success') {
        setStatus('verified');
        setValidationClass('success');

        if (onVerify) onVerify(true, type);

        setFieldError(name, '');
      } else {   
        setFieldError(name, validationMessages.string.failToVerify);
      }

      setWaiting(false);
    }

    const redoVerification = () => {
      setInputValue(prefix ? prefix : '');
      setCodeValue('');
      setFieldValue(name, prefix ? prefix : '');
      setFieldValue(`${name}_code`, '');
      setStatus('initial');

      if (onVerify) onVerify(false, type);        
    }

    return (
        <div className="validation_box">
            <div className={`field el_wrap ${focusState ? 'is-focused' : ''} ${valueState ? 'has-value' : ''} ${validationClass}`}>
                <label className="field-label" htmlFor={name}>{label}</label>
                <Field innerRef={inputRef} className='field-input' type="text" id={name} name={name} placeholder={placeholder} value={inputValue} onChange={onChange} onFocus={onFocus} onBlur={onBlur} autoComplete="off" disabled={status === 'codeSent' || status === 'verified'} />
                <ErrorMessage component="div" className="error-list" name={name} />
            </div>
            <div className='validation_wrap'>
              {
                  status === 'initial' && 
                    <button className={`icm-btn icm-btn-primary ${waiting ? 'waiting' : ''}`} onClick={getCode}disabled={waiting}>{t("get_validation_code_text")}</button>                
              }
              {
                  status === 'codeSent' && 
                  <>
                    <Field type="text" id={`${name}_code`} name={`${name}_code`} placeholder={t("validation_input_placeholder")} value={codeValue} onChange={onCodeChange} autoComplete="off" />
                    <button className={`icm-btn icm-btn-primary ${waiting ? 'waiting' : ''}`} disabled={waiting} onClick={verifyCode}>{t("verify_validation_code_text")}</button>
                    {
                      countdownSeconds > 0 ?
                      <div className="message-list">{t("validation_countdown_message").replace('${type}', t(`${type}_label`).toLowerCase()).replace('${seconds}', countdownSeconds.toString())}</div>
                      : 
                      <div className='message-list'>{t("resend_validation_code_text")} <a className='resend' onClick={getCode}>{t("resend_validation_code_link")}</a></div>
                    }
                  </>
              }
              {
                (status === 'codeSent' || status === 'verified') && 
                <div className="message-list">{t("redo_validation_text").replace('${type}', t(`${type}_label`).toLowerCase())} <a className='redo' onClick={redoVerification}>{t("redo_validation_link")}</a></div>
              }
            </div>
            <ErrorMessage component="div" className="error-list" name={`${name}_code`} />
            {codeFailureMessage && <div className="error-list">{codeFailureMessage}</div>}
        </div>
    )
}

export default ValidationBox