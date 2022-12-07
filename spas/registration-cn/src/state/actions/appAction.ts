import { ActionType } from "../action-types";
import { AccountType } from "../../types/App";
import { ModalData } from "../../types/FormControls";

export interface changeAccountTypeAction {
    type: ActionType.CHANGE_ACCOUNT_TYPE;
    payload: AccountType
}

export interface changeCurrentCountryAction {
    type: ActionType.CHANGE_CURRENT_COUNTRY;
    payload: {country: string, stepType: 'individual' | 'joint'}
}

export interface forceUseCnNamesAction {
    type: ActionType.FORCE_USE_CN_NAMES;
    payload: {flag: boolean, stepType: 'individual' | 'joint'}
}

export interface updateEmailVerifiedStatusAction {
    type: ActionType.UPDATE_EMAIL_VERIFIED_STATUS;
    payload: {flag: boolean, stepType: 'individual' | 'joint'}
}

export interface updatePhoneVerifiedStatusAction {
    type: ActionType.UPDATE_PHONE_VERIFIED_STATUS;
    payload: {flag: boolean, stepType: 'individual' | 'joint'}
}

export interface updateShowAutoAddressStatusAction {
    type: ActionType.UPDATE_SHOW_AUTO_ADDRESS_STATUS;
    payload: {flag: boolean, stepType: 'individual' | 'joint'}
}

export interface updateSumsubCredentialAction {
    type: ActionType.UPDATE_SUMSUB_CREDENTIAL;
    payload: {credential: any, stepType: 'individual' | 'joint'}
}

export interface updateSumsubVerifiedStatusAction {
    type: ActionType.UPDATE_SUMSUB_VERIFIED_STATUS;
    payload: {flag: boolean, stepType: 'individual' | 'joint'}
}

export interface updateModalDataAction {
    type: ActionType.UPDATE_MODAL_DATA;
    payload: ModalData | null
}

export interface setShowRegOverlayAction {
    type: ActionType.SET_SHOW_REG_OVERLAY;
    payload: boolean
}

export type AppAction = 
    | changeAccountTypeAction 
    | changeCurrentCountryAction
    | forceUseCnNamesAction
    | updateEmailVerifiedStatusAction
    | updatePhoneVerifiedStatusAction
    | updateShowAutoAddressStatusAction
    | updateSumsubCredentialAction
    | updateSumsubVerifiedStatusAction 
    | updateModalDataAction
    | setShowRegOverlayAction