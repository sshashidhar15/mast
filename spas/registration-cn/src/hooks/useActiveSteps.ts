import React, { useMemo } from 'react';
import { useTypedSelector } from "./useTypedSelector";
import { AccountType } from '../types/App';
import { StepType } from '../types/Step';

export const useActiveSteps = () => {
    const { steps } = useTypedSelector( state => state.step )
    const { accountType } = useTypedSelector( state => state.app );
    
    const activeSteps = useMemo(() => (
      steps.filter( step => (
        accountType === AccountType.joint || 
        (accountType === AccountType.individual && step.type === StepType.individual) || 
        (accountType === AccountType.corporate && step.type === StepType.individual)
      ))
    ), [steps, accountType]);

    return activeSteps;
}