export interface FeedData {
    branches: Branch[],
    countries: Country[],
    currenciesList: Currency[],
    identityCountries: string[],
    locationByIP: LocationByIP,
    questionList: string,
    questionnaires: Questionnaire[],
    tradePlatforms: branchedTradePlatform[],
    tradePlatformsIslamic: branchedTradePlatform[],
    whitelist: string[]
}

export enum BranchId {
    asic = "1",
    cysec = "2",
    fsa = "3",
    scb = "4",
    fca = "5",
}

export enum BranchName {
    asic = "ASIC",
    cysec = "CySEC",
    fsa = "FSA",
    scb = "SCB",
    fca = "FCA"
}

export interface Branch {
    ID: BranchId
    name: BranchName
}

export interface Country {
    id: string,
    code: string,
    name: string,
    tel: string,
    branching: {
        branch: BranchId,
        default: boolean,
        ib: boolean,
        status: "1" | "2" | "3" | "4",
        isTrulioo: boolean,
        islamic: boolean
    }[]
}

export interface Currency {
    branch: BranchId,
    items: {
        id: string,
        name: string,
        islamic: boolean
    }[]
}

export interface LocationByIP {
    as: string,
    city: string,
    country: string,
    countryCode: string,
    isp: string,
    lat: number,
    lon: number,
    org: string,
    query: string,
    region: string,
    regionName: string,
    timezone: string,
    zip: string
}

export interface Questionnaire {
    PossibleAnswers: null | {
        WPossibleAnswer: {
        ID: string,
        IsKnockout: string,
        KnockoutMessage: string,
        Name: string
    }[]},
    Question: {
        ID: string,
        Name: string,
        CustomerQuestionTypeId: string,
        UniqueValueByUser: string
    }
}

export interface TradPlatform {
    id: string,
    name: string,
    accountTypes: {
        id: string,
        name: string
    }[]
}

export interface branchedTradePlatform {
    branch: string,
    tradePlatforms: TradPlatform[]
}