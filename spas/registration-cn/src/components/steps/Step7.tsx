import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Step3Raw from './Step3Raw';
import { scrollToTop } from '../../utils/ui';

const Step7 = () => {
    const { t } = useTranslation();

    useEffect(() => {
      scrollToTop();
    }, [])    
   
    return (
        <div className="register_form step7">
          <h1 className="reg_title">{t("step7_heading_live")}</h1>
          <div className="row">
            <div className="col-md-12">
                <Step3Raw stepType='joint' />
            </div>
          </div>
        </div>
      )
}

export default Step7