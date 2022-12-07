import React from 'react';
import { SelectButtonSetting } from '../../types/FormControls';

interface SelectButtonProps {
    setting: SelectButtonSetting;
    selected: boolean;
    onSelect: (val: string) => void;
}

const SelectButton: React.FC<SelectButtonProps> = ({setting, selected, onSelect}) => {
    const { value, label, icon, iconOnSelect, background } = setting;
    const backgroundImage = background ? "url(" + background + ")" : '';

    return (
        <div className={`select_btn rounded_el ${selected ? 'selected' : ''}`} onClick={() => onSelect(value)} style={{backgroundImage}}>
            {icon && <img src={icon} alt={label} className="icon-default" />}
            {iconOnSelect && <img src={iconOnSelect} alt={label} className="icon-selected" />}
            <span>{label}</span>
        </div>
    )
}

export default SelectButton