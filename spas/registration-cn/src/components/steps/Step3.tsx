import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Step3Raw from './Step3Raw';
import { scrollToTop } from '../../utils/ui';

const Step3 = () => {
    const { t } = useTranslation();

    useEffect(() => {
        scrollToTop();
    }, [])    
   
    return (
        <div className="register_form step3">
          <h1 className="reg_title">{t("step3_heading_live")}</h1>
          <div className="row">
            <div className="col-md-12">
                <Step3Raw stepType='individual' />
            </div>
          </div>
        </div>
      )
}

export default Step3