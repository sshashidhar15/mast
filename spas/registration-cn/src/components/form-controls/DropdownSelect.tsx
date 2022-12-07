import React, {useState, useRef, useEffect} from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { Scrollbar } from "react-scrollbars-custom";
import { SelectItem } from '../../types/FormControls';
import { FormValues } from '../../types/FormValues';

interface SelectProps {
    label?: string,
    placeholder: string,
    name: string,
    allowInput: boolean,
    items: SelectItem[],
    setValue?: string,
    showFirstValue?: boolean,
    prefix?: string,
    maxHeight?: number,
    onChange?: (name: string, val: string) => void,
    onBlur?: (name: string, val: string) => void,
}

const DropdownSelect: React.FC<SelectProps> = (props) => {
    const { label, placeholder, name, allowInput, items, setValue, showFirstValue, prefix, maxHeight, onChange: onValueChange, onBlur: onElementBlur } = props;
    const inputRef = useRef(null);
    const ulRef = useRef(null);
    const timerRef = useRef(null);
    const [ showDropdown, setShowDropdown ] = useState(false);
    const [ currentItemIndex, setCurrentItemIndex ] = useState(-1);
    const [ inputValue, setInputValue ] = useState<string>('');
    const [ activeItems, setActiveItems ] = useState<SelectItem[]>([]);
    const [ dropdownHeight, setDropdownHeight] = useState(maxHeight);

    const { values: formValues, handleBlur, setFieldValue, setFieldTouched } = useFormikContext<FormValues>();

    useEffect(() => {
        return (() => {
            if (timerRef.current) clearTimeout(timerRef.current);
        })
    }, [])

    useEffect(() => {
        if (setValue === undefined || setValue === null) return;
        if (setValue === inputValue) return;
        if (!items || items.length === 0) return;

        let initialItem = items.filter(item => item.value == setValue);
        if (initialItem.length > 0) {
            setInputValue(initialItem[0].label);
            setFieldValue(name, setValue);
            setFieldTouched(name, true, false);
        }
    }, [setValue, items])    

    useEffect(() => {
        if (!items || items.length === 0) return;

        setActiveItems([...items]);

        if(formValues[name as keyof FormValues]) {
            let initialItem = items.filter(item => item.value == formValues[name as keyof FormValues]);
            if (initialItem.length === 0) return;
            setInputValue(initialItem[0].label);
        } else if (showFirstValue) {
            setInputValue(items[0].label);
            setFieldValue(name, items[0].label);
        }
    }, [items])

    useEffect(() => {
        if(ulRef.current) {
            setDropdownHeight(ulRef.current.clientHeight);
        }
    }, [activeItems])

    useEffect(() => {
        if(showDropdown && ulRef.current) {
            setDropdownHeight(ulRef.current.clientHeight);
        }
    }, [showDropdown])

    useEffect(() => {
        let newItem = items.filter(item => item.label === inputValue);

        if (newItem.length === 0) return;

        if (onValueChange) onValueChange(name, newItem[0].value);
    }, [inputValue])

    const onClick = (value: string) => {
        setInputValue(value);
        let result = items.filter(item => item.label === value);
        setFieldValue(name, result[0].value);
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setCurrentItemIndex(currentItemIndex === activeItems.length - 1 ? activeItems.length - 1 : currentItemIndex + 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (currentItemIndex !== -1) {
                    setCurrentItemIndex(currentItemIndex === 0 ? 0 : currentItemIndex - 1);
                }
                break;
            case 'Enter':
                event.preventDefault();
                if (currentItemIndex !== -1) {
                    setInputValue(activeItems[currentItemIndex].label);
                    setFieldValue(name, activeItems[currentItemIndex].value);
                    inputRef.current.blur();
                }
                break;
            default:
        }
    }    

    const onFocus = () => {
        setShowDropdown(true);
    }

    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        timerRef.current = setTimeout(() => {
            handleBlur(event);

            let newInput = '';
            let newValue = '';
    
            if (event.target.value) {
                const filtered = activeItems.filter(item => item.label.toLowerCase() === event.target.value.toLowerCase());
    
                if (filtered.length > 0) {
                    newInput = event.target.value[0].toUpperCase() + event.target.value.slice(1)
                    newValue = filtered[0].value;
                } 
            }
    
            setInputValue(newInput);
            setFieldValue(name, newValue);
            if (onElementBlur) onElementBlur(name, newValue); 

            if (showDropdown) clearDropdown();
        }, 250)
    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        setActiveItems([...items.filter(item => !item.featured && item.label.toLowerCase().includes(event.target.value.toLowerCase()))]);
    }

    const generateListItems = () => (
        activeItems.map((item, index) => (
            <li key={`${item.featured ? 'featured' : ''}${item.id}`} id={`${prefix ? prefix : ''}${item.value.toLocaleLowerCase()}`} className={`${item.featured ? 'featured' : ''} ${item.featured && activeItems[index + 1] && !activeItems[index + 1].featured ? 'last-featured' : ''} ${index === currentItemIndex ? 'active' : ''}`} onClick={() => onClick(item.label)}>{item.label}</li>
        ))
    )

    const clearDropdown = () => {
        setShowDropdown(false);
        setActiveItems([...items]);
        setCurrentItemIndex(-1);
    }

    return (
        <div className="searchDropdown el_wrap">
            <label htmlFor={name} className="field-label">{label}</label>
            <div className='input-select'>
                <Field className="field-input" type="text" name={name} placeholder={placeholder} value={inputValue} innerRef={inputRef} readOnly={!allowInput} autoComplete="off" onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} />
                <ErrorMessage component="div" className="error-list" name={name} />
                {
                    showDropdown && activeItems.length > 0 && 
                        <div className="options_list_wrap">
                            <Scrollbar style={{ height: dropdownHeight, maxHeight: maxHeight }}>
                                <ul className="options_list" ref={ulRef}>
                                    {generateListItems()}
                                </ul>
                            </Scrollbar>
                        </div>
                }
            </div>
        </div>
    )
}

export default DropdownSelect;