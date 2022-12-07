import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Step5Raw from './Step5Raw';
import { scrollToTop } from '../../utils/ui';

const Step5 = () => {
    const { t } = useTranslation();

    useEffect(() => {
      scrollToTop();
    }, [])    
   
    return (
        <div className="register_form step5">
          <h1 className="reg_title">{t("step5_heading_live")}</h1>
          <div className="row">
            <div className="col-md-12">
                <Step5Raw stepType='individual' />
            </div>
          </div>
        </div>
      )
}

export default Step5