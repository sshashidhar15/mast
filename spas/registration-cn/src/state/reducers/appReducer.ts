import { ActionType } from "../action-types";
import { AccountType } from "../../types/App";
import { AppAction } from "../actions";
import { BranchId } from '../../types/FeedData';
import { ModalData } from '../../types/FormControls';

interface AppDataState {
    branchId: BranchId,
    accountType: AccountType,
    currentCountry: string,
    jointCurrentCountry: string,
    forceUseCnNamesSwitch: boolean,
    jointForceUseCnNamesSwitch: boolean,
    useSumsub: boolean,
    useEmailValidation: boolean,
    usePhoneValidation: boolean,
    emailVerifiedStatus: boolean,
    jointEmailVerifiedStatus: boolean,
    phoneVerifiedStatus: boolean,
    jointPhoneVerifiedStatus: boolean,
    showAutoAddress: boolean,
    jointShowAutoAddress: boolean,    
    sumsubCredential: any,
    jointSumsubCredential: any,
    sumsubVerifiedStatus: boolean,
    jointSumsubVerifiedStatus: boolean,
    modalData: ModalData | null,
    defaultTradePlatform: string,
    defaultTradeAccountType: string,
    defaultCurrency: string,
    showRegOverlay: boolean;
}

const initialAppDataState: AppDataState = {
    branchId: window['currentBranchID'] as BranchId,
    accountType: AccountType.individual,
    currentCountry: '',
    jointCurrentCountry: '',
    forceUseCnNamesSwitch: window['currentLocale'] === 'cn',
    jointForceUseCnNamesSwitch: window['currentLocale'] === 'cn',
    useSumsub: false,
    useEmailValidation: true,
    usePhoneValidation: false,
    emailVerifiedStatus: false,
    jointEmailVerifiedStatus: false,
    phoneVerifiedStatus: false,    
    jointPhoneVerifiedStatus: false,
    showAutoAddress: true,
    jointShowAutoAddress: true,
    sumsubCredential: null,
    jointSumsubCredential: null,    
    sumsubVerifiedStatus: false,    
    jointSumsubVerifiedStatus: false,
    modalData: null,
    defaultTradePlatform: 'MT5',
    defaultTradeAccountType: 'Standard Account',
    defaultCurrency: window['currentBranchID'] === '1' ? '3' : '2', // 3 - AUD, 2 - USD,
    showRegOverlay: false
};

const reducer = (
    state: AppDataState = initialAppDataState,
    action: AppAction
): AppDataState => {
    switch (action.type) {
        case ActionType.CHANGE_ACCOUNT_TYPE:
            return { ...state, accountType: action.payload };
        case ActionType.CHANGE_CURRENT_COUNTRY:
            if (action.payload.stepType === 'joint') {
                return { ...state, jointCurrentCountry: action.payload.country };
            } 
            return { ...state, currentCountry: action.payload.country };
        case ActionType.FORCE_USE_CN_NAMES:
            if (action.payload.stepType === 'joint') {
                return { ...state, jointForceUseCnNamesSwitch: action.payload.flag };
            }             
            return { ...state, forceUseCnNamesSwitch: action.payload.flag };    
        case ActionType.UPDATE_EMAIL_VERIFIED_STATUS:
            if (action.payload.stepType === 'joint') {
                return { ...state, jointEmailVerifiedStatus: action.payload.flag };
            }
            return { ...state, emailVerifiedStatus: action.payload.flag };     
        case ActionType.UPDATE_PHONE_VERIFIED_STATUS:
            if (action.payload.stepType === 'joint') {
                return { ...state, jointPhoneVerifiedStatus: action.payload.flag };
            }
            return { ...state, phoneVerifiedStatus: action.payload.flag };
        case ActionType.UPDATE_SHOW_AUTO_ADDRESS_STATUS:
            if (action.payload.stepType === 'joint') {
                return { ...state, jointShowAutoAddress: action.payload.flag };
            }
            return { ...state, showAutoAddress: action.payload.flag };   
        case ActionType.UPDATE_SUMSUB_CREDENTIAL:
            if (action.payload.stepType === 'joint') {
                return { ...state, jointSumsubCredential: action.payload.credential ? {...action.payload.credential} : null};
            }
            return { ...state, sumsubCredential: action.payload.credential ? {...action.payload.credential} : null };
        case ActionType.UPDATE_SUMSUB_VERIFIED_STATUS:
            if (action.payload.stepType === 'joint') {
                return { ...state, jointSumsubVerifiedStatus: action.payload.flag };
            }
            return { ...state, sumsubVerifiedStatus: action.payload.flag };              
        case ActionType.UPDATE_MODAL_DATA:
            return { ...state, modalData: action.payload ? {...action.payload} : null}
        case ActionType.SET_SHOW_REG_OVERLAY:
            return { ...state, showRegOverlay: action.payload }            
        default:
            return state;
    }
};

export default reducer;
