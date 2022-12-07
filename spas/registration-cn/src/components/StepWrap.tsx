import React, {useEffect} from 'react';
import { useFormikContext } from 'formik';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useActions } from '../hooks/useActions';
import { FormValues } from '../types/FormValues';
import { useActiveSteps } from '../hooks/useActiveSteps';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';
import Step7 from './steps/Step7';
import Step8 from './steps/Step8';
import Step9 from './steps/Step9';

const StepWrapper = () => {
    const { currentStep } = useTypedSelector(state => state.step);
    const activeSteps = useActiveSteps();
    const { updateFormValues } = useActions();
    const { values: formValues } = useFormikContext<FormValues>();

    useEffect(() => {
        updateFormValues(formValues);
    }, [formValues])    

    return (
        <>
            {activeSteps[currentStep - 1].id === 1 && <Step1 />}
            {activeSteps[currentStep - 1].id === 2 && <Step2 />}
            {activeSteps[currentStep - 1].id === 3 && <Step3 />}
            {activeSteps[currentStep - 1].id === 4 && <Step4 />}
            {activeSteps[currentStep - 1].id === 5 && <Step5 />}
            {activeSteps[currentStep - 1].id === 6 && <Step6 />}
            {activeSteps[currentStep - 1].id === 7 && <Step7 />}
            {activeSteps[currentStep - 1].id === 8 && <Step8 />}
            {activeSteps[currentStep - 1].id === 9 && <Step9 />}            
        </>
    )
}

export default StepWrapper
