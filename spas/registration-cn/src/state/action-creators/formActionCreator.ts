import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import { FormAction } from "../actions";
import { FormValues } from "../../types/FormValues";

export const updateFormValues = (formValues: FormValues) => {
    return (dispatch: Dispatch<FormAction>) => {
        dispatch({
            type: ActionType.UPDATE_FORM_VALUES,
            payload: formValues
        })
    }
}
