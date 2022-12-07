import React from 'react';
import { useTranslation } from 'react-i18next';
import StepIndicator from './parts/StepIndicator';
import { useActiveSteps } from '../hooks/useActiveSteps';
import logo from '../assets/images/Logo.svg';

const Nav = () => {
  const { t } = useTranslation();

  const activeSteps = useActiveSteps();

  const generateSteps = () => (
    activeSteps.map( (step, i) => <StepIndicator key={i} index={i + 1} step={step} />)
  )

  return (
    <div className='register_process_wrap'>
      <div className="reg_logo">
          <img src={logo} alt="ICMarkets Logo" />
          <p>Global Markets at Your Fingertips</p>
      </div>
      <div className={`reg_process ${window['regType'] === 'live' ? 'live' : 'demo'}`}>
        {generateSteps()}
        <div className="process_line last">
            <div className="step_line">
                <div className="step_icon"></div>
            </div>
            <div className="process_line_text" >
              {
                `${window['regType'] === 'live' ? t("open_account_live") : t("open_account_demo")
              }`}
            </div>
        </div>        
      </div>
      <div className="reg_timer">
          <span>Estimated time to complete:</span>
          <br />
          <b>{`${window['regType'] === 'live' ? '2 minutes' : '30 seconds'}`}</b>
      </div>
    </div>
  )
}

export default Nav