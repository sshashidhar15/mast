import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import { AccountType } from "../../types/App";
import { AppAction } from "../actions";
import { ModalData } from "../../types/FormControls";

export const changeAccountType = (accountType: AccountType) => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.CHANGE_ACCOUNT_TYPE,
            payload: accountType
        })
    }
}

export const changeCurrentCountry = (country: string, stepType: 'individual' | 'joint') => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.CHANGE_CURRENT_COUNTRY,
            payload: {country, stepType}
        })
    }
}

export const forceUseCnNames = (flag: boolean, stepType: 'individual' | 'joint') => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.FORCE_USE_CN_NAMES,
            payload: {flag, stepType}
        })
    }
}

export const updateEmailVerifiedStatus = (flag: boolean, stepType: 'individual' | 'joint') => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.UPDATE_EMAIL_VERIFIED_STATUS,
            payload: {flag, stepType}
        })
    }
}

export const updatePhoneVerifiedStatus = (flag: boolean, stepType: 'individual' | 'joint') => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.UPDATE_PHONE_VERIFIED_STATUS,
            payload: {flag, stepType}
        })
    }
}

export const updateShowAutoAddressStatus = (flag: boolean, stepType: 'individual' | 'joint') => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.UPDATE_SHOW_AUTO_ADDRESS_STATUS,
            payload: {flag, stepType}
        })
    }
}

export const updateSumsubCredential = (credential: any, stepType: 'individual' | 'joint') => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.UPDATE_SUMSUB_CREDENTIAL,
            payload: {credential, stepType}
        })
    }
}

export const updateSumsubVerifiedStatus = (flag: boolean, stepType: 'individual' | 'joint') => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.UPDATE_SUMSUB_VERIFIED_STATUS,
            payload: {flag, stepType}
        })
    }
}

export const updateModalData = (data: ModalData) => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.UPDATE_MODAL_DATA,
            payload: data
        })
    }
}

export const setShowRegOverlay = (flag: boolean) => {
    return (dispatch: Dispatch<AppAction>) => {
        dispatch({
            type: ActionType.SET_SHOW_REG_OVERLAY,
            payload: flag
        })
    }
}
