import individualIcon from '../assets/images/Individual.svg';
import individualOnSelectIcon from '../assets/images/Individual_white.svg';
import jointIcon from '../assets/images/Joint.svg';
import jointOnSelectIcon from '../assets/images/Joint_white.svg';
import corporateIcon from '../assets/images/Corporate.svg';
import corporateOnSelectIcon from '../assets/images/Corporate_white.svg';

export type SelectItem = {
    id: string;
    value: string;
    label: string;
    featured?: boolean;
};

export type SelectButtonSetting = {
    value: string;
    label?: string;
    icon?: string;
    iconOnSelect?: string;
    background?: string;
    default?: boolean;
}

export type ModalData = {
    type: 'info' | 'redirection',
    title: string,
    content: string,
    buttonText?: string,
    buttonLink?: string,
    disableClose?: boolean
}

const RegTypeLabel = {
    en: {
        individual: "Individual",
        joint: "Joint",
        corporate: "Corporate"
    },
    cn: {
        individual: "个人",
        joint: "联名",
        corporate: "公司"
    }
}

export const RegTypes: SelectButtonSetting[] = [
    {
        value: "individual",
        label: window['currentLocale'] === 'cn' ? RegTypeLabel['cn']['individual'] : RegTypeLabel['en']['individual'],
        icon: individualIcon,
        iconOnSelect: individualOnSelectIcon
    },
    {
        value: "joint",
        label: window['currentLocale'] === 'cn' ? RegTypeLabel['cn']['joint'] : RegTypeLabel['en']['joint'],
        icon: jointIcon,
        iconOnSelect: jointOnSelectIcon
    },
    {
        value: "corporate",
        label: window['currentLocale'] === 'cn' ? RegTypeLabel['cn']['corporate'] : RegTypeLabel['en']['corporate'],
        icon: corporateIcon,
        iconOnSelect: corporateOnSelectIcon
    },        
];    

const monthLabel = {
    en: {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    },
    cn: {
        1: "一月",
        2: "二月",
        3: "三月",
        4: "四月",
        5: "五月",
        6: "六月",
        7: "七月",
        8: "八月",
        9: "九月",
        10: "十月",
        11: "十一月",
        12: "十二月"
    }    
}

export const monthItems: SelectItem[] = [
    {
        id: "1",
        value: "1",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['1'] : monthLabel['en']['1'],
    },
    {
        id: "2",
        value: "2",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['2'] : monthLabel['en']['2'],
    },
    {
        id: "3",
        value: "3",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['3'] : monthLabel['en']['3'],
    },
    {
        id: "4",
        value: "4",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['4'] : monthLabel['en']['4'],
    },
    {
        id: "5",
        value: "5",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['5'] : monthLabel['en']['5'],
    },
    {
        id: "6",
        value: "6",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['6'] : monthLabel['en']['6'],
    },
    {
        id: "7",
        value: "7",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['7'] : monthLabel['en']['7'],
    },
    {
        id: "8",
        value: "8",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['8'] : monthLabel['en']['8'],
    },
    {
        id: "9",
        value: "9",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['9'] : monthLabel['en']['9'],
    },
    {
        id: "10",
        value: "10",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['10'] : monthLabel['en']['10'],
    },
    {
        id: "11",
        value: "11",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['11'] : monthLabel['en']['11'],
    },
    {
        id: "12",
        value: "12",
        label: window['currentLocale'] === 'cn' ? monthLabel['cn']['12'] : monthLabel['en']['12'],
    }                                            
]

export type Address = {
    address: string;
    city: string;
    state: string;
    zip_code: string;
}

export const SecurityQuestions: SelectItem[] = [
    {
        id: '1',
        value: "What is your mother's maiden name?",
        label: "What is your mother's maiden name?"
    },
    {
        id: '2',
        value: "What was your first pet's name?",
        label: "What was your first pet's name?"
    },
    {
        id: '3',
        value: "What street did you grow up on?",
        label: "What street did you grow up on?"
    },
    {
        id: '4',
        value: "What is your favourite colour?",
        label: "What is your favourite colour?"
    },
    {
        id: '5',
        value: "What is your favourite actor, musician, or artist?",
        label: "What is your favourite actor, musician, or artist?"
    }            
]