import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import DropdownSelect from './DropdownSelect';
import Input from './Input';
import { monthItems } from '../../types/FormControls';
import { FormValues } from '../../types/FormValues';

interface DateSelectProps {
    name: string;
    label?: string;
}

const DateSelect: React.FC<DateSelectProps> = (props) => {
    const { name, label } = props;
    const [ date, setDate ] = useState({
        day: null,
        month: null,
        year: null
    });

    const { t } = useTranslation();

    const { errors } = useFormikContext<FormValues>();     

    useEffect(() => {
        if (errors[`${name}_day` as keyof typeof errors] || errors[`${name}_month` as keyof typeof errors] || errors[`${name}_year` as keyof typeof errors]) return;
        if (!date.year || !date.month || !date.day) return;

        let newDateStr = date.year + '-' + date.month + '-' + date.day;
        if (isNaN(Date.parse(newDateStr))) return;

        let newDateObj = new Date(parseInt(date.year), parseInt(date.month) - 1, parseInt(date.day));
        let newDay = newDateObj.getDate().toString();
        let newMonth = (newDateObj.getMonth() + 1).toString();
        let newYear = newDateObj.getFullYear().toString();

        if (date.day === newDay && date.month === newMonth && date.year === newYear) return;

        setDate({day: newDay, month: newMonth, year: newYear}); 
    }, [date])

    const handleValueChange = (na: string, val: string) => {
        let arr = na.split('_');
        let key = arr[arr.length - 1];

        let newDate = {
            ...date,
            [key]: val
        };

        setDate({...newDate});
    }

    return (
        <div className="date_select">
            <div className="input_group_title">
                {label}
            </div>
            <div className="input_group_items">
                <Input type="text" placeholder={t("date_day_placeholder")} name={`${name}_day`} setValue={date.day} onBlur={handleValueChange} />
                <DropdownSelect placeholder={t("date_month_placeholder")} name={`${name}_month`} allowInput={false} items={monthItems} setValue={date.month} onChange={handleValueChange} />
                <Input type="text" placeholder={t("date_year_placeholder")} name={`${name}_year`} setValue={date.year} onBlur={handleValueChange} />
            </div>
        </div>
    )
}

export default DateSelect