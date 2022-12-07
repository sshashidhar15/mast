import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import { StepAction } from "../actions";
import { StepStatus } from "../../types/Step";

export const goToStep = (index: number) => {
    return (dispatch: Dispatch<StepAction>) => {
        dispatch({
            type: ActionType.GO_TO_STEP,
            payload: index
        })
    }
}

export const setStepStatus = (id: number, status: StepStatus) => {
    return (dispatch: Dispatch<StepAction>) => {
        dispatch({
            type: ActionType.SET_STEP_STATUS,
            payload: {
                id,
                status
            }
        })
    }
}