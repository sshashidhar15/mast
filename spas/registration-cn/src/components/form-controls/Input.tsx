import React, {useState, useEffect} from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { FormValues } from '../../types/FormValues';

interface InputProps {
    name: string,
    type: string,
    label?: string,
    placeholder?: string,
    prefix?: string,
    setValue?: string | null,
    onChange?: (name: string, val: string) => void,
    onBlur?: (name: string, val: string) => void
}

const Input: React.FC<InputProps> = (props) => {;
    const {label, name, type, placeholder, prefix, setValue, onChange: onValueChange, onBlur: onElementBlur} = props;
    const [inputValue, setInputValue] = useState<string>('');
    const [focusState, setFocusState] = useState(false);
    const [valueState, setValueState] = useState(false);
    const [validationClass, setValidationClass] = useState('');

    const { values: formValues, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched } = useFormikContext<FormValues>();

    useEffect(() => {
        if(formValues[name as keyof FormValues]) {
            setInputValue(formValues[name as keyof FormValues]);
            setFieldTouched(name, false, false);
            setValidationClass('');
        }
    }, [])

    useEffect(() => {
        if (setValue === undefined || setValue === null) return;
        if (setValue === inputValue) return;

        setInputValue(setValue);
        setFieldValue(name, setValue);
        setFieldTouched(name, false, false);
        setValidationClass('');
    }, [setValue])

    useEffect(() => {
        if (prefix === undefined || prefix === null) return;
        if (prefix === inputValue) return;
        if (setValue) return;

        setInputValue(prefix);
        setFieldValue(name, prefix);
        setFieldTouched(name, false, false);
        setValidationClass('');
    }, [prefix, setValue])     

    useEffect(() => {
        if (touched[name as keyof typeof touched]) {
            if (errors[name as keyof typeof errors]) {
                setValidationClass('error');
            } else {
                if (inputValue) setValidationClass('success');
            }
        }
    }, [errors, touched, inputValue])

    useEffect(() => {
        if (inputValue) {
            setValueState(true);
        } else {
            setValueState(false);
        }
    }, [inputValue])

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        setInputValue(e.target.value);
        if(onValueChange) onValueChange(name, e.target.value);
    }

    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setFocusState(true)
    }

    const onBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        handleBlur(e);
        setFocusState(false)
        if(onElementBlur)  onElementBlur(name, e.target.value);
    }

    return (
        <div className="input_wrap">
            <div className={`field el_wrap ${focusState ? 'is-focused' : ''} ${valueState ? 'has-value' : ''} ${validationClass}`}>
                <label className="field-label" htmlFor={name}>{label}</label>
                <Field className="field-input" type={type} id={name} name={name} placeholder={placeholder} value={inputValue} onChange={onChange} onFocus={onFocus} onBlur={onBlur} autoComplete="off" />
                <ErrorMessage component="div" className="error-list" name={name} />
            </div>
        </div>
    )
};

export default Input
