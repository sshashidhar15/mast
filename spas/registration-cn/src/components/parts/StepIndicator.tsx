import React from 'react';
import { useTranslation } from 'react-i18next';
import { useActions } from '../../hooks/useActions';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { Step } from '../../types/Step'

interface StepIndicatorProps {
    index: number,
    step: Step
}

const StepIndicator: React.FC<StepIndicatorProps> = ({index, step}) => {
    const { currentStep } = useTypedSelector(state => state.step);
    const { goToStep } = useActions();

    const { t } = useTranslation();

    const handleClick = () => {
        if (index >= currentStep) return;
        goToStep(index);
    }

    return (
        <div className={`process_line ${currentStep === index ? 'current' : currentStep > index ? 'complete' : ''}`}>
            <div className="step_line">
                <div className="step_icon" onClick={handleClick}>{index}<div className="modify-step"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z"></path></svg></div></div>
            </div>
            <div className="process_line_text">
                {window['regType'] === 'live' ? t(`step${step.id}_title_live`) : t(`step${step.id}_title_demo`)}
            </div>
        </div>
    )
}

export default StepIndicator