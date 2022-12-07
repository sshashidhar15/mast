import { ActionType } from "../action-types";
import { FormValues } from "../../types/FormValues";

export interface UpdateFormValuesAction {
    type: ActionType.UPDATE_FORM_VALUES;
    payload: FormValues
}

export type FormAction = 
    | UpdateFormValuesAction