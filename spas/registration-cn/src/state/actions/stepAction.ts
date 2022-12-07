import { ActionType } from "../action-types";
import { StepStatus } from "../../types/Step";

export interface GoToStepAction {
    type: ActionType.GO_TO_STEP;
    payload: number
}

export interface SetStepStatusAction {
    type: ActionType.SET_STEP_STATUS;
    payload: {
        id: number,
        status: StepStatus
    }
}

export type StepAction = 
    | GoToStepAction
    | SetStepStatusAction