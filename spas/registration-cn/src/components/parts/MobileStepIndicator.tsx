import React from 'react';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { Step } from '../../types/Step'

interface MobileStepIndicatorProps {
    index: number,
    step: Step
}

const MobileStepIndicator: React.FC<MobileStepIndicatorProps> = ({index, step}) => {
    const { currentStep } = useTypedSelector(state => state.step);
    const { goToStep } = useActions();

    const handleClick = () => {
        if (index >= currentStep) return;
        goToStep(index);
    }    

    return (
        <div className={`process_line ${currentStep === index ? 'current' : currentStep > index ? 'complete' : ''}`}>
            <div className="step_line">
                <div className="step_icon" onClick={handleClick}>{index}</div>
            </div>
        </div>
    )
}

export default MobileStepIndicator