import React, { useEffect, useState } from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { FormValues } from '../../types/FormValues';

interface CheckBoxProps {
    name: string;
    label: string;
    setValue?: string;
    onChange?: (name: string, val: string) => void;
}

const Checkbox: React.FC<CheckBoxProps> = ({ name, label, setValue, onChange: onValueChange}) => {
    const [checked, setChecked] = useState(false);
    const { values: formValues, setFieldValue  } = useFormikContext<FormValues>();

    useEffect(() => {
        if (formValues[name as keyof FormValues]) {
            setChecked(formValues[name as keyof FormValues] === 'on' ? true: false);
        }
    }, [])

    useEffect(() => {
        if (setValue) {
            setChecked(setValue === 'on' ? true: false);
            setFieldValue(name, setValue);
        }
    }, [setValue])

    const handleValueChange = () => {
        let newChecked = !checked;
        setChecked(newChecked);
        setFieldValue(name, newChecked ? 'on' : 'off');

        if (onValueChange) onValueChange(name, newChecked ? 'on' : 'off');
    }

    return (
        <div className='checkbox_wrap'>
            <Field type="checkbox" className='checkbox' name={name} checked={checked} />
            <label htmlFor={name} onClick={handleValueChange}>{label}</label>
            <ErrorMessage component="div" className="error-list" name={name} />
        </div>
    )
}

export default Checkbox