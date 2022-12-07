import * as Yup from 'yup';
import { AccountType } from '../types/App';
import { validationMessages } from './messages';

Yup.setLocale({
  mixed: {
    required: validationMessages.mixed.required
  },
  string: {
    email: validationMessages.string.email,
    matches: validationMessages.string.matches,
    length: ({length}) => validationMessages.string.length.replace('${length}', length.toString()),
  },
  number: {
    min: ({min}) => validationMessages.number.min.replace('${min}', min.toString()),
    max: ({max}) => validationMessages.number.max.replace('${max}', max.toString()),
  }
})

export const getValidationSchema = (regulator: string, steps: number[], accountType: string, forceUseCnNamesSwitch: boolean, jointForceUseCnNamesSwitch: boolean, showAutoAddress: boolean, jointShowAutoAddress: boolean) => {
  let schema = {};
  let schemaArray = getValidationSchemaArray(regulator, accountType, forceUseCnNamesSwitch, jointForceUseCnNamesSwitch, showAutoAddress, jointShowAutoAddress);

  for (let i = 0; i < steps.length; i++) {
    schema = {
      ...schema,
      ...schemaArray[steps[i] - 1]
    }
  }

  return schema;
}

const getValidationSchemaArray = (regulator: string, accountType: string, forceUseCnNamesSwitch: boolean, jointForceUseCnNamesSwitch: boolean, showAutoAddress: boolean, jointShowAutoAddress: boolean) => {
  switch (accountType) {
    case AccountType['individual']:
      return individualValidationSchema(regulator, forceUseCnNamesSwitch, showAutoAddress);
    case AccountType['joint']:
      return jointValidationSchema(regulator, forceUseCnNamesSwitch, jointForceUseCnNamesSwitch, showAutoAddress, jointShowAutoAddress);
    case AccountType['corporate']:
      return corporateValidationSchema(regulator, forceUseCnNamesSwitch);
  }
}

const individualValidationSchema = (regulator: string, forceUseCnNamesSwitch: boolean, showAutoAddress: boolean) => [
  step1Schema(forceUseCnNamesSwitch),
  step2Schema(showAutoAddress),
  step3Schema(),
  regulator === '1' && step4Schema,
  step5Schema()
];

const jointValidationSchema = (regulator: string, forceUseCnNamesSwitch: boolean, jointForceUseCnNamesSwitch: boolean, showAutoAddress: boolean, jointShowAutoAddress: boolean) => [
  step1Schema(forceUseCnNamesSwitch),
  step2Schema(showAutoAddress),
  step3Schema(),
  regulator === '1' && step4Schema,
  step5Schema(),
  step6Schema(jointForceUseCnNamesSwitch, jointShowAutoAddress),
  step7Schema(),
  step8Schema(),
  step9Schema(),
];

const corporateValidationSchema = (regulator: string, forceUseCnNamesSwitch: boolean) => [
  step1Schema(forceUseCnNamesSwitch),
  step2CorporateSchema(),
  step3Schema(),
  regulator === '1' && step4Schema,
  step5Schema(),
];

const step1Schema = (forceUseCnNamesSwitch: boolean) => (
  {
    first_name: forceUseCnNamesSwitch ? Yup.string().required().matches(/^[\u4e00-\u9fa5]+$/) : Yup.string().required().matches(/^[A-Za-z]+$/),
    last_name: forceUseCnNamesSwitch ? Yup.string().required().matches(/^[\u4e00-\u9fa5]+$/) : Yup.string().required().matches(/^[A-Za-z]+$/),
    email: Yup.string().email().required(),
    phone: Yup.string().required().matches(/^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/),
  }
)

const step2Schema = (showAutoAddress: boolean) => (
  {
    reg_type: Yup.string().required(),
    birth_day: Yup.number().typeError(validationMessages.number.typeError).min(1).max(31).required(),
    birth_month: Yup.string().required(),
    birth_year: Yup.number().typeError(validationMessages.number.typeError).min(new Date().getFullYear() - 90).max(new Date().getFullYear() - 18).required(),
    auto_address: showAutoAddress ? Yup.string().required() : Yup.string(),
    address: !showAutoAddress ? Yup.string().required() : Yup.string(),
    city: !showAutoAddress ? Yup.string().required() : Yup.string(),
    state: !showAutoAddress ? Yup.string().required() : Yup.string(),
    zip_code: !showAutoAddress ? Yup.string().required() : Yup.string(),
    qq_id: Yup.number().typeError(validationMessages.number.typeError),
    reffer: Yup.string(),
    reffer_id:  Yup.string().when('reffer', {
      is: 'on',
      then: Yup.string().required()
    })
  }  
)

const step2CorporateSchema = () => (
  {
    reg_type: Yup.string().required(),
    first_name2: Yup.string().required().matches(/^[A-Za-z\u4e00-\u9fa5]+$/), 
    last_name2: Yup.string().required().matches(/^[A-Za-z\u4e00-\u9fa5]+$/),
    email2: Yup.string().required().email(),
    phone2: Yup.string().required().matches(/^([0-9]|[\-()+]){9,}$/),
    city2: Yup.string().required(),
    country2: Yup.string().required(),
    signatory_birth_day: Yup.number().typeError(validationMessages.number.typeError).min(1).max(31).required(),
    signatory_birth_month: Yup.string().required(),
    signatory_birth_year: Yup.number().typeError(validationMessages.number.typeError).min(new Date().getFullYear() - 90).max(new Date().getFullYear() - 18).required(),
    qq_id_corporate: Yup.number().typeError(validationMessages.number.typeError),
    company_name: Yup.string().required(),
    legal_entity_id: Yup.string().required().length(20),
    place_incorporation: Yup.string().required(),
    fax: Yup.string().matches(/^([0-9]|[\-()+]){9,}$/),
    incorporation_birth_day: Yup.number().typeError(validationMessages.number.typeError).min(1).max(31).required(),
    incorporation_birth_month: Yup.string().required(),
    incorporation_birth_year: Yup.number().typeError(validationMessages.number.typeError).required(),
    registered_country: Yup.string().required(),
    registered_street_number: Yup.string().required(),
    registered_street: Yup.string().required(),
    registered_city: Yup.string().required(),
    registered_state: Yup.string().required(),
    registered_zip_code: Yup.string().required(),
    busaddr: Yup.string(),
    business_country: Yup.string().when('busaddr', {
      is: 'off',
      then: Yup.string().required()
    }),
    business_street_number: Yup.string().when('busaddr', {
      is: 'off',
      then: Yup.string().required()
    }),
    business_street: Yup.string().when('busaddr', {
      is: 'off',
      then: Yup.string().required()
    }),
    business_city: Yup.string().when('busaddr', {
      is: 'off',
      then: Yup.string().required()
    }),
    business_state: Yup.string().when('busaddr', {
      is: 'off',
      then: Yup.string().required()
    }),
    business_zip_code: Yup.string().when('busaddr', {
      is: 'off',
      then: Yup.string().required()
    }),
    reffer: Yup.string(),
    reffer_id:  Yup.string().when('reffer', {
      is: 'on',
      then: Yup.string().required()
    })
  }
)

const step3Schema = () => (
  {
    trading_platform: Yup.string().required(),
    account_type: Yup.string().required(),
    currency: Yup.string().required()
  }  
)

const step4Schema = () => ({})

const step5Schema = () => ({
  security_question: Yup.string().required(),
  security_answer: Yup.string().required(),
  i_agree_with_all_of_above: Yup.mixed().oneOf(['on'], validationMessages.mixed.oneOf)
})

const step6Schema = (jointForceUseCnNamesSwitch: boolean, jointShowAutoAddress: boolean) => (
  {
    joint_first_name: jointForceUseCnNamesSwitch ? Yup.string().required().matches(/^[\u4e00-\u9fa5]+$/) : Yup.string().required().matches(/^[A-Za-z]+$/),
    joint_last_name: jointForceUseCnNamesSwitch ? Yup.string().required().matches(/^[\u4e00-\u9fa5]+$/) : Yup.string().required().matches(/^[A-Za-z]+$/),
    joint_email: Yup.string().email().required(),
    joint_email_code: Yup.string().required(),
    joint_phone: Yup.string().required().matches(/^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/),
    joint_birth_day: Yup.number().typeError(validationMessages.number.typeError).min(1).max(31).required(),
    joint_birth_month: Yup.string().required(),
    joint_birth_year: Yup.number().typeError(validationMessages.number.typeError).min(1900).max(new Date().getFullYear() - 18).required(),
    joint_auto_address: jointShowAutoAddress ? Yup.string().required() : Yup.string(),
    joint_address: !jointShowAutoAddress ? Yup.string().required() : Yup.string(),
    joint_city: !jointShowAutoAddress ? Yup.string().required() : Yup.string(),
    joint_state: !jointShowAutoAddress ? Yup.string().required() : Yup.string(),
    joint_zip_code: !jointShowAutoAddress ? Yup.string().required() : Yup.string(),
    joint_qq_id: Yup.number().typeError(validationMessages.number.typeError),
    joint_reffer: Yup.string(),
    joint_reffer_id:  Yup.string().when('reffer', {
      is: 'on',
      then: Yup.string().required()
    })    
  }
)

const step7Schema = () => (
  {
    joint_trading_platform: Yup.string().required(),
    joint_account_type: Yup.string().required(),
    joint_currency: Yup.string().required()
  }  
)

const step8Schema = () => ({})

const step9Schema = () => ({
  joint_security_question: Yup.string().required(),
  joint_security_answer: Yup.string().required(),
  joint_i_agree_with_all_of_above: Yup.mixed().oneOf(['on'], validationMessages.mixed.oneOf)
})