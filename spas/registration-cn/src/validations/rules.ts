import { checkEmail } from '../utils/regApi';

export const checkEmailAvailable = async function (val: string) {
    if (!val) return true;

    const res = await checkEmail(val);

    return res !== null && res === 'unused' ? true : false;
};
