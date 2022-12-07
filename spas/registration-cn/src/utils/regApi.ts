import axios from "axios";

const getSignToken = async ()  => {
    try {
        const token = await axios.get(window['serverURL'] + '~get~sign~token~?nocache=' + Date.now());

        return token ? token.data : null;
    } catch (err) {
        return null;
    }
}

export const checkEmail = async (email: string) => {
    try {
        const token = await getSignToken();

        if (!token) return null;

        const res = await axios.get(window['serverURL'] + '?sign=' + token + '&data=' + email + '&branch=' + window['currentBranchID'] + '&getAction=check_branched_email&request_from=' + window['request_from']);
        
        if (res) return res.data;

        return null;
    } catch (err) {
        return null;
    }
}

export const createEmailCode = async (email: string, lang: string) => {
    try {
        const token = await getSignToken();

        if (!token) return null;

        const res = await axios.get(window['serverURL'] + '?sign=' + token + '&data=' + email + '&lang=' + lang + '&getAction=create_email_verification_code');
        
        if (res) return res.data;

        return null;
    } catch (err) {
        return null;
    }
}

export const verifyEmailCode = async (email: string, code: string) => {
    try {
        const token = await getSignToken();

        if (!token) return null;

        const res = await axios.get(window['serverURL'] + '?sign=' + token + '&data=' + email + '&code=' + code + '&getAction=verify_email_verification_code');
        
        if (res) return res.data;

        return null;
    } catch (err) {
        return null;
    }
}

export const createMobileCode = async (mobile: string, lang: string) => {
    try {
        const token = await getSignToken();

        if (!token) return null;

        const res = await axios.get(window['serverURL'] + '?sign=' + token + '&data=' + mobile + '&lang=' + lang + '&getAction=create_mobile_verification_code' + '&from=cn');
        
        if (res) return res.data;

        return null;
    } catch (err) {
        return null;
    }
}

export const verifyMobileCode = async (mobile: string, code: string) => {
    try {
        const token = await getSignToken();

        if (!token) return null;

        const res = await axios.get(window['serverURL'] + '?sign=' + token + '&data=' + mobile + '&code=' + code + '&getAction=verify_mobile_verification_code');

        if (res) return res.data;

        return null;
    } catch (err) {
        return null;
    }
}

export const getSumsubCredential = async() => {
    try {
        const token = await getSignToken();

        if (!token) return null;
        
        const res = await axios.get(window['serverURL'] + '?sign=' + token + '&getAction=get_sumsub_token');

        if (res) return res.data;
        return null;
    } catch (err) {
        return null;
    }
}

export const getSumsubUserData = async(userId: string) => {
    try {
        const token = await getSignToken();

        if (!token) return null;
        
        const res = await axios.get(window['serverURL'] + '?sign=' + token + '&getAction=get_sumsub_user_data&data=' + userId);

        if (res) return res.data;
        return null;
    } catch (err) {
        return null;
    }
}

export const submitData = async (data: any) => {
    try {
        const token = await getSignToken();

        if (!token) return null;

        const res = await axios.post(window['serverURL'], {
            ...data,
            sign: token
        });

        return res.data;
    } catch (err) {
        return err;
    }

}

