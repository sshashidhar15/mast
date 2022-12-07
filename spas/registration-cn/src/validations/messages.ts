const allValidationMessages = {
    cn: {
        mixed: {
            required: "该栏必须填写",
            oneOf: "此项必须勾选"
        },
        string: {
            email: "电子邮箱格式不正确",
            emailUsed: "该电子邮箱已被使用",
            matches: "无效输入",
            failToVerify: "验证失败，请输入正确的验证码", 
            notVerified: "必须完成验证",    
            length: "长度必须为${length}个字符"    
        },
        number: {
            typeError: "必须输入数字",
            min: "此数值须不小于${min}",
            max: "此数值须不大于${max}"
        },
        custom: {
            cantFindAddress: "找不到您的地址，请手动输入"
        }
    },
    en: {
        mixed: {
            required: "This value is required",
            oneOf: "This must be ticked"
        },
        string: {
            email: "Must be a valid email",
            emailUsed: "This email is already used",
            matches: "This value seems to be invalid",
            failToVerify: "Verification failed, please check verification code",
            notVerified: "Verification must be completed",
            length: "Length must be $(length) characters"
        },
        number: {
            typeError: "You must specify a number",
            min: "This value should be greater than ${min}",
            max: "This value should be no greater than ${max}"
        },
        custom: {
            cantFindAddress: "Can't find your address. Please input manually"
        }        
    }
}

export const validationMessages = allValidationMessages[window['currentLocale'] === 'cn' ? 'cn' : 'en'];