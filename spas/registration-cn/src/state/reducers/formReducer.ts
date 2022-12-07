import { ActionType } from "../action-types";
import { FormAction } from "../actions";
import { initialFormValues, FormValues } from "../../types/FormValues";
import { cloneDeep } from 'lodash';

interface FormState {
    values: FormValues
}

const initialFormState: FormState = {
    values: cloneDeep(initialFormValues)
};

const reducer = (
    state: FormState = initialFormState,
    action: FormAction
): FormState => {
    switch (action.type) {
        case ActionType.UPDATE_FORM_VALUES:
            return { values: cloneDeep(action.payload) };
        default:
            return state;
    }
};

export default reducer;
