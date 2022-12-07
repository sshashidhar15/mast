export interface Step1Data {
    country: string;
    first_name: string;
    last_name: string;
    email: string;
    email_code: string;
    phone: string;
    phone_code: string;
}

export interface Step2Data {
    reg_type: string;
    islamic: string;
    passport: string;
    driverLicence: string;
    nationalId: string;
    passportExpiryDate: string;
    driverLicenceExpiryDate: string;
    nationalIdExpiryDate: string;    
    birth_day: string;
    birth_month: string;
    birth_year: string;
    auto_address: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    qq_id: string;
    first_name2: string;
    last_name2: string;
    city2: string;
    email2: string;
    country2: string;
    phone2: string;
    signatory_birth_day: string;
    signatory_birth_month: string;
    signatory_birth_year: string;
    qq_id_corporate: string;
    company_name: string,
    legal_entity_id: string,
    place_incorporation: string,
    fax: string,
    incorporation_birth_day: string,
    incorporation_birth_month: string,
    incorporation_birth_year: string,
    registered_country: string,
    registered_street_number: string,
    registered_street: string,
    registered_city: string;
    registered_state: string;
    registered_zip_code: string;
    busaddr: string;
    business_country: string,
    business_street_number: string,
    business_street: string,
    business_city: string;
    business_state: string;
    business_zip_code: string;
    reffer: string;
    reffer_id: string;
}

export interface Step3Data {
    trading_platform: string;
    account_type: string;
    currency: string;
}

export interface Step4Data {}

export interface Step5Data {
    security_question: string;
    security_answer: string;
    i_agree_with_all_of_above: string;
}

export interface Step6Data {
    joint_passport: string;
    joint_driverLicence: string;
    joint_nationalId: string;
    joint_passportExpiryDate: string;
    joint_driverLicenceExpiryDate: string;
    joint_nationalIdExpiryDate: string; 
    joint_country: string;
    joint_first_name: string;
    joint_last_name: string;
    joint_birth_day: string;
    joint_birth_month: string;
    joint_birth_year: string;
    joint_email: string;
    joint_email_code: string;
    joint_phone: string;
    joint_phone_code: string;
    joint_auto_address: string;
    joint_address: string;
    joint_city: string;
    joint_state: string;
    joint_zip_code: string;
    joint_qq_id: string;
    joint_reffer: string;
    joint_reffer_id: string;
}

export interface Step7Data {
    joint_trading_platform: string;
    joint_account_type: string;
    joint_currency: string;
}

export interface Step8Data {}

export interface Step9Data {
    joint_security_question: string;
    joint_security_answer: string;
    joint_i_agree_with_all_of_above: string;    
}

export interface FormValues extends Step1Data, Step2Data, Step3Data, Step4Data, Step5Data, Step6Data, Step7Data, Step8Data, Step9Data {}

export const initialStep1Data: Step1Data = {
    country: '',
    first_name: '',
    last_name: '',
    email: '',
    email_code: '',
    phone: '',
    phone_code: ''
}

export const initialStep2Data: Step2Data = {
    reg_type: 'individual',
    islamic: 'off',
    passport: '',
    driverLicence: '',
    nationalId: '',
    passportExpiryDate: '',
    driverLicenceExpiryDate: '',
    nationalIdExpiryDate: '',      
    birth_day: '',
    birth_month: '',
    birth_year: '',
    auto_address: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',    
    qq_id: '',
    first_name2: '',
    last_name2: '',
    city2: '',
    email2: '',    
    country2: '',
    phone2: '',
    signatory_birth_day: '',
    signatory_birth_month: '',
    signatory_birth_year: '',
    qq_id_corporate: '',
    company_name: '',
    legal_entity_id: '',
    place_incorporation: '',
    fax: '',
    incorporation_birth_day: '',
    incorporation_birth_month: '',
    incorporation_birth_year: '',
    registered_country: '',
    registered_street_number: '',
    registered_street: '',
    registered_city: '',
    registered_state: '',
    registered_zip_code: '',
    busaddr: 'off',
    business_country: '',
    business_street_number: '',
    business_street: '',
    business_city: '',
    business_state: '',
    business_zip_code: '',
    reffer: 'off',
    reffer_id: ''
}

export const initialStep3Data: Step3Data = {
    trading_platform: '',
    account_type: '',
    currency: ''
}

export const initialStep4Data: Step4Data = {}

export const initialStep5Data: Step5Data = {
    security_question: '',
    security_answer: '',
    i_agree_with_all_of_above: 'off'
}

export const initialStep6Data: Step6Data = {
    joint_passport: '',
    joint_driverLicence: '',
    joint_nationalId: '',
    joint_passportExpiryDate: '',
    joint_driverLicenceExpiryDate: '',
    joint_nationalIdExpiryDate: '',    
    joint_country: '',
    joint_first_name: '',
    joint_last_name: '',
    joint_birth_day: '',
    joint_birth_month: '',
    joint_birth_year: '',  
    joint_email: '',
    joint_email_code: '',
    joint_phone: '',
    joint_phone_code: '',
    joint_auto_address: '',
    joint_address: '',
    joint_city: '',
    joint_state: '',
    joint_zip_code: '',
    joint_qq_id: '',
    joint_reffer: 'off',
    joint_reffer_id: '',
}

export const initialStep7Data: Step7Data = {
    joint_trading_platform: '',
    joint_account_type: '',
    joint_currency: '',
}

export const initialStep8Data: Step8Data = {}

export const initialStep9Data: Step9Data = {
    joint_security_question: '',
    joint_security_answer: '',
    joint_i_agree_with_all_of_above: 'off'  
}

export const initialFormValues: FormValues = {
    ...initialStep1Data,
    ...initialStep2Data,
    ...initialStep3Data,
    ...initialStep4Data,
    ...initialStep5Data,
    ...initialStep6Data,
    ...initialStep7Data,
    ...initialStep8Data,
    ...initialStep9Data
}