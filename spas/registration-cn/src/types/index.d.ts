export {};

declare global {
  interface Window {
    isItCySECWebSite: string;
    isUserFromCySECCountry: string;
    serverURL: string;
    cysecWebsiteURL: string;
    cysecWebsiteName: string;
    cysecRegformURL: string;
    cysecCountriesString: string;
    currentBranchID: string;
    currentLocale: string;
    countryFrom: string;
    forceCountryFrom: string;
    jwt: string;
    utcTimestamp: string;
    isSupportedCurrentBranch: string;
    suggestedCountry: string;
    request_from: string;
    userIP: string;
    countryByIP: string;
    currentDomain: string;
    regType: string;
  }
}