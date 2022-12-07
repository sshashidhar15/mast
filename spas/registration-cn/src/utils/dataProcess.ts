import Cookies from 'js-cookie';
import { Country } from "../types/FeedData";
import { SelectItem } from "../types/FormControls";
import { FormValues } from "../types/FormValues";

export const sortCountries = (countries: Country[]): SelectItem[] => {
    let c: SelectItem[] = [];

    let foundSeparator = false;
    countries.forEach((country, index) => {
      if (country.name === 'separator') {
        foundSeparator = true;
        return;
      }

      c.push({
        id: country.id,
        value: country.name,
        label: country.name,
        featured: !foundSeparator
      })        
    })
    
    // Featured countries displayed first
    c.sort((a, b) => {
      if (a.featured && b.featured) return 0;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
    })

    return c;
}

export const convertDateFormat = (date: string) => {
  if (date.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)) return date;
  return '';
}

export const prepareDataToSubmit = (data: FormValues, type: string | null = null) => {
  const dataToSubmit: any = {...data};

  const tracking_info = localStorage.getItem('visitor-tracking');
  if (tracking_info) {
    dataToSubmit['tracking_info'] = tracking_info;
  }

  if (dataToSubmit.reg_type === 'corporate') {
    dataToSubmit['birth_day'] = dataToSubmit['signatory_birth_day'];
    dataToSubmit['birth_month'] = dataToSubmit['signatory_birth_month'];
    dataToSubmit['birth_year'] = dataToSubmit['signatory_birth_year'];
  }

  // Reg Service requires month value from 0 to 11 so manually change from 1 to 12
  dataToSubmit['birth_month'] = dataToSubmit['birth_month'] ? (parseInt(dataToSubmit['birth_month']) - 1).toString() : dataToSubmit['birth_month'];
  dataToSubmit['joint_birth_month'] = dataToSubmit['joint_birth_month'] ? (parseInt(dataToSubmit['joint_birth_month']) - 1).toString() : dataToSubmit['joint_birth_month'];
  dataToSubmit['signatory_birth_month'] = dataToSubmit['signatory_birth_month'] ? (parseInt(dataToSubmit['signatory_birth_month']) - 1).toString() : dataToSubmit['signatory_birth_month'];
  dataToSubmit['incorporation_birth_month'] = dataToSubmit['incorporation_birth_month'] ? (parseInt(dataToSubmit['incorporation_birth_month']) - 1).toString() : dataToSubmit['incorporation_birth_month'];

  // No questionaire for China
  dataToSubmit['additional_answers'] = JSON.stringify([]);
  dataToSubmit['joint_additional_answers'] = JSON.stringify([]);

  if (!dataToSubmit['reffer_id']) {
    dataToSubmit['reffer_id'] = Cookies.get('camp');
  }

  // Additional fields required by Reg Service
  dataToSubmit['branch_id'] = window['currentBranchID'];
  dataToSubmit['joint_branch_id'] = window['currentBranchID'];
  dataToSubmit['ip'] = window['userIP'];
  dataToSubmit['ip_country'] = window['countryByIP'];
  dataToSubmit['request_from'] = window['request_from'];
  dataToSubmit['registered_from_domain'] = window['currentDomain'];
  dataToSubmit['language'] = window['currentLocale'];
  
  if (type === 'simple') {
    dataToSubmit['reg_type'] = 'simple';
  } else if (window['regType'] === 'demo') {
    dataToSubmit['reg_type'] = 'demo';
  }

  return dataToSubmit;
}