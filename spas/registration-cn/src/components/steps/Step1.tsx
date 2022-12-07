import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { scrollToTop } from '../../utils/ui';
import Step1Raw from './Step1Raw';

const Step1 = () => {
  const { t } = useTranslation();

  useEffect(() => {
    scrollToTop();
  }, [])

  return (
    <div className="register_form step1">
      <h1 className="reg_title">{t("step1_heading_live")}</h1>
      <div className="row">
        <div className="col-md-12">
          <Step1Raw stepType='individual' />
        </div>
      </div>
    </div>
  )
}

export default Step1