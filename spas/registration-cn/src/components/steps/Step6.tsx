import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Step1Raw from './Step1Raw';
import Step2Raw from './Step2Raw';
import Reffer from '../form-controls/Reffer';
import { scrollToTop } from '../../utils/ui';

const Step6 = () => {
  const { t } = useTranslation();

  useEffect(() => {
    scrollToTop();
  }, [])  

  return (
    <div className="register_form step6">
      <h1 className="reg_title">{t("step6_heading_live")}</h1>
      <div className="row">
        <div className="col-md-12">
          <Step1Raw stepType='joint' />
          <Step2Raw stepType='joint' />
          <Reffer stepType='joint' />
        </div>
      </div>
    </div>
  )
}

export default Step6