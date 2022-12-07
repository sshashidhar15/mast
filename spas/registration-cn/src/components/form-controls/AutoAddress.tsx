import React, {useState, useEffect, useCallback, useRef} from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import Input from './Input';
import { Address } from '../../types/FormControls';
import { FormValues } from '../../types/FormValues';
import { getAddressSuggestions, getAddressDetails } from '../../utils/addressApi';

interface AutoAddressProps {
  name: string;
  country: string;
  mode: 'auto' | 'manual';
  onModeChange?: (autoMode: boolean) => void,
}

const AutoAddress: React.FC<AutoAddressProps> = ({name, country, mode, onModeChange}) => {
  const timerRef = useRef(null);
  const [ autoMode, setAutoMode ] = useState(null);
  const [ address, setAddress ] = useState<Address>({
    address: null,
    city: null,
    state: null,
    zip_code: null
  });
  const [ addressList, setAddressList ] = useState([]);
  const { values: formValues, setFieldTouched, setFieldValue } = useFormikContext<FormValues>();
  const { t } = useTranslation();

  useEffect(() => {
    if (mode === 'manual' || 
      formValues[`${name}address` as keyof FormValues] || 
      formValues[`${name}city` as keyof FormValues] || 
      formValues[`${name}state` as keyof FormValues] ||
      formValues[`${name}zip_code` as keyof FormValues]
    ) {
      setAutoMode(false);
    } else {
      setAutoMode(true);
    }

    return (() => {
      if (timerRef.current) clearTimeout(timerRef.current);
    })    
  }, [])

  const switchMode = () => {
    setAutoMode(!autoMode);
  }

  useEffect(() => {
    if (autoMode) {
      setAddress({
        address: '',
        city: '',
        state: '',
        zip_code: ''
      })
      setFieldTouched(`${name}address`, false, false);
      setFieldTouched(`${name}city`, false, false);
      setFieldTouched(`${name}state`, false, false);
      setFieldTouched(`${name}zip_code`, false, false);
      setFieldValue(`${name}address`, '');      
      setFieldValue(`${name}city`, '');    
      setFieldValue(`${name}state`, '');    
      setFieldValue(`${name}zip_code`, '');    
    } else {
      setFieldTouched(`${name}auto_address`, false, false);
      setFieldValue(`${name}auto_address`, '');
    }

    if (onModeChange) onModeChange(autoMode);
  }, [autoMode])

  const handleAddressInput = useCallback(debounce(async (name: string, val: string) => {
    if (!country) return;

    if (val.length < 3) {
      if (addressList.length > 0) {
        setAddressList([]);        
      }

      return;
    }

    const res = await getAddressSuggestions(country, val);

    if (res) {
      setAddressList([...res.map((el: any) => ({
        url: el.format,
        text: el.text
      }))])
    }
  }, 500), [country])

  const generateAddressList = () => {
    return addressList.map((el, index) => (
      <li key={index} onClick={() => handleChoosingAddress(el.url)}>{el.text}</li>
    ))
  }

  const handleChoosingAddress = async (url: string) => {
      const res = await getAddressDetails(url, country);

      if (res) {
        setAddress({
          address: res.address,
          city: res.city,
          state: res.state,
          zip_code: res.zipCode
        })
  
        setAutoMode(false);
      }
  }

  const handleAddressBlur = (name: string, val: string) => {
    timerRef.current = setTimeout(() => {
      if (addressList.length > 0) setAddressList([]);
    }, 250);
  }

  return (
    <div className='auto-address '>
      {
        mode === 'auto' && 
          <div className='switch el_wrap'>
          {
            autoMode ? (
              <button type="button" className="address-selector change-to-manual" onClick={switchMode}>
                <img src="/icm-open-account/icons/Magnifying_glass.svg" alt="Switch to Manual Address Input" /> {t("cant_find_your_address")}
              </button>  
            ) : (
              <button type="button" className="address-selector change-to-auto" onClick={switchMode}>
                <img src="/icm-open-account/icons/Magnifying_glass.svg" alt="Switch to Auto Address Input" /> {t("auto_find_address")}
              </button>
            )
          }
        </div>
      }
      <div className='input-wrap row'>
      {
        autoMode ? (
            <div className="col-md-12">
              <Input type="text" name={`${name}auto_address`} label={t("address_label")} onChange={handleAddressInput} onBlur={handleAddressBlur} />
              {
                addressList.length > 0 && 
                <ul className='address-list'>
                  {generateAddressList()}
                </ul>
              }
          </div>
        ) : (
          <div className="manual-wrap">
            <div className="col-md-12 first">
              <Input type="text" name={`${name}address`} label={t("address_label")} setValue={address.address} />
            </div>
            <div className={`col-md-4`}>
            <Input type="text" name={`${name}city`} label={t("city_label")} setValue={address.city} />
            </div>
            <div className={`col-md-4`}>
            <Input type="text" name={`${name}state`} label={t("state_label")} setValue={address.state} />
            </div>
            <div className={`col-md-4`}>
            <Input type="text" name={`${name}zip_code`} label={t("zip_code_label")} setValue={address.zip_code} />
            </div>
          </div>
        )}
      </div>            
    </div>
  )
}

export default AutoAddress;