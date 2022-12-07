import { ActionType } from "../action-types";
import { StepAction } from "../actions";
import { Step, LiveSteps, DemoSteps } from "../../types/Step";

export interface StepState {
    steps: Step[],
    currentStep: number,
}

// For branches other than ASIC, exclude the steps of questionnaire
const liveSteps = window['currentBranchID'] === '1' ? LiveSteps : LiveSteps.filter(step => step.id !== 4 && step.id !== 8);

const initialFeedDataState: StepState = {
    steps: window['regType'] === 'live' ? liveSteps : DemoSteps,
    currentStep: 1
};

const reducer = (
    state: StepState = initialFeedDataState,
    action: StepAction
): StepState => {
    switch (action.type) {
        case ActionType.GO_TO_STEP:
            return { ...state, currentStep: action.payload };
        case ActionType.SET_STEP_STATUS:
            return {...state, steps: state.steps.map( step => (
                step.id === action.payload.id ? {...step, status: action.payload.status} : {...step}
            ))}
        default:
            return state;
    }
};

export default reducer;
