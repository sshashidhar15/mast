import React from 'react';
import { useActiveSteps } from '../hooks/useActiveSteps';
import MobileStepIndicator from './parts/MobileStepIndicator';

const MobileNav = () => {
  const activeSteps = useActiveSteps();

  const generateSteps = () => (
    activeSteps.map( (step, i) => <MobileStepIndicator key={i} index={i + 1} step={step} />)
  )

  return (
    <div className={`steps_container ${activeSteps.length > 5 ? 'wrap' : ''}`}>
      {generateSteps()}
      <div className="process_line last">
        <div className="step_line">
            <div className="step_icon"></div>
        </div>
      </div>
    </div>
  )
}

export default MobileNav