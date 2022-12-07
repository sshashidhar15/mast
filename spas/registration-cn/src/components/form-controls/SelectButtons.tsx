import React, { useState, useEffect } from 'react'
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { FormValues } from '../../types/FormValues';
import { SelectButtonSetting } from '../../types/FormControls';
import SelectButton from './SelectButton';

interface SelectButtonProps {
    name: string;
    label: string;
    size: 'small' | 'large';
    type: 'normal' | 'questionnaire';
    options: SelectButtonSetting[];
    onChange?: (name: string, val: string) => void;
}

const SelectButtons: React.FC<SelectButtonProps> = ({name, label, size, options, type, onChange: onValueChange}) => {
    const [ inputValue, setInputValue ] = useState<string>('');

    const { values: formValues, setFieldValue } = useFormikContext<FormValues>();

    useEffect(() => {
        if (formValues[name as keyof FormValues]) {
            setInputValue(formValues[name as keyof FormValues]);
        }
    }, [])

    useEffect(() => {
        if (options.length === 0) return;
        
        const defaultOptions = options.filter(el => el.default);
        if (defaultOptions.length === 0) return;

        setInputValue(defaultOptions[0].value);
        setFieldValue(name, defaultOptions[0].value);
    }, [options])    

    const onSelect = (val: string) => {
        setInputValue(val);
        setFieldValue(name, val);

        if (onValueChange) onValueChange(name, val);
    }

    const generateButtons = () => (
        options.map((option, index) => (
            <SelectButton key={index} setting={option} onSelect={onSelect} selected={inputValue === option.value} />
        ))
    )

    return (
        <div className={`select_btns ${size} ${type === 'questionnaire' ? 'questionnaire' : ''}`}>
            <div className='input_group_title'>{label}</div>
            <div className='input_group_items select_btns_group'>
                { generateButtons() }
            </div>
            <Field className="field-input" type="hidden" name={name} value={inputValue} />
            <ErrorMessage component="div" className="error-list" name={name} />
        </div>
    )
}

export default SelectButtons