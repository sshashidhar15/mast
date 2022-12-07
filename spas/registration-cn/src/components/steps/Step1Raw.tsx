import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import Input from '../form-controls/Input';
import ValidationBox from '../form-controls/ValidationBox';
import DropdownSelect from '../form-controls/DropdownSelect';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { SelectItem  } from '../../types/FormControls';
import { sortCountries } from '../../utils/dataProcess';
import Checkbox from '../form-controls/Checkbox';
import { FormValues } from '../../types/FormValues';

interface Step1RawProps {
  stepType: 'individual' | 'joint'
}

const Step1Raw: React.FC<Step1RawProps> = ({stepType}) => {
  const { data } = useTypedSelector(state => state.feed);
  const form = useTypedSelector(state => state.form);
  const { useEmailValidation, usePhoneValidation } = useTypedSelector(state => state.app);
  const { changeCurrentCountry, forceUseCnNames, updateEmailVerifiedStatus, updatePhoneVerifiedStatus} = useActions();
  const [ countries, setCountries ] = useState<SelectItem[]>([]);
  const [ country, setCountry ] = useState(null);
  const [ countryCode, setCountryCode ] = useState(null);
  const [ showUseCnNameOption, setShowUseCnNameOption] = useState(false);

  const { forceUseCnNamesSwitch, jointForceUseCnNamesSwitch } = useTypedSelector(state => state.app);

  const { t } = useTranslation();

  const { validateField } = useFormikContext<FormValues>(); 

  const prefix = stepType === 'joint' ? 'joint_' : '';

  useEffect(() => {
    const result = sortCountries(data.countries).filter(c => c.value = 'China')[0];
    result['label'] = window['currentLocale'] === 'cn' ? '中国' : 'China';
    setCountries([result]);

    if (!form.values[`${prefix}country` as keyof typeof form.values]) {
      setCountry('China');
    }
  }, [])

  const handleCountryChange = (name: string, val: string) => {
    if (val !== form.values[`${prefix}country` as keyof typeof form.values]) {
      let result = data.countries.filter(c => c.name === val);

      if (result && result.length > 0) {
        setCountryCode(result[0].tel);
      }   
      
      changeCurrentCountry(val, stepType);
    }
  }

  const checkCnName = (name: string, val: string) => {
    if (
      stepType === 'individual' && forceUseCnNamesSwitch || 
      stepType === 'joint' && jointForceUseCnNamesSwitch
    )  {
      if (val && !val.match(/^[\u4e00-\u9fa5]+$/)) {
        setShowUseCnNameOption(true);
      } 
    }
  }

  const handleUseCnNameOptionChange = (name: string, val: string) => {
    if (val === 'on') {
      forceUseCnNames(false, stepType);
    } else {
      forceUseCnNames(true, stepType);
    }

    setTimeout(() => {
      validateField(`${prefix}first_name`);
      validateField(`${prefix}last_name`);
    }, 250)
  }

  const handleValidationStatus = (verified: boolean, type: string) => {
    if (type === 'email') {
      updateEmailVerifiedStatus(verified, stepType);
    } else if (type === 'phone') {
      updatePhoneVerifiedStatus(verified, stepType);
    }
  }

  return (
    <>
      <div className="input_group">
        <DropdownSelect label={t("country_label")} placeholder={t("country_placeholder")} name={`${prefix}country`} allowInput={true} items={countries} setValue={country} maxHeight={400} onChange={handleCountryChange} />
      </div>

      { 
        window['currentLocale'] === 'cn' ? 
          <>
            { showUseCnNameOption && 
              <div className='input_group'>
                  <Checkbox name={`${prefix}use_cn_name`} label="请输入中文姓名，如没有中文姓名请勾选此处" onChange={handleUseCnNameOptionChange} />
              </div>          
            }

            <div className="input_group">
              <Input type="text" label={t("last_name_label")} name={`${prefix}last_name`} onBlur={checkCnName} />
            </div>

            <div className="input_group">
              <Input type="text" label={t("first_name_label")} name={`${prefix}first_name`} onBlur={checkCnName} />
            </div>
          </>
        :
        <>
            <div className="input_group">
              <Input type="text" label={t("first_name_label")} name={`${prefix}first_name`} />
            </div>
            <div className="input_group">
              <Input type="text" label={t("last_name_label")} name={`${prefix}last_name`} />
            </div>            
        </>
      }

      <div className="input_group">
        {
          window['regType'] === 'live' && useEmailValidation ? 
          <ValidationBox label={t("email_label")} name={`${prefix}email`} type="email" placeholder="" onVerify={handleValidationStatus} />
          : 
          <Input type="text" label={t("email_label")} name={`${prefix}email`} />
        }
      </div>       

      <div className="input_group">
        {
          window['regType'] === 'live' && usePhoneValidation ? 
          <ValidationBox label={t("phone_label")} name={`${prefix}phone`} type="phone" placeholder="" prefix={countryCode} onVerify={handleValidationStatus} />
          : 
          <Input type="text" label={t("phone_label")} name={`${prefix}phone`} prefix={countryCode}/>
        }
      </div>
    </>
  )
}

export default Step1Raw