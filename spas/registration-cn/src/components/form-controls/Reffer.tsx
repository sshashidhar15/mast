import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import Input from './Input';
import Checkbox from './Checkbox';
import { FormValues } from '../../types/FormValues';

interface RefferProps {
    stepType: 'individual' | 'joint'
}

const Reffer: React.FC<RefferProps> = ({stepType}) => {
    const [ refferId, setRefferId ] = useState('');
    const { values: formValues, setFieldValue } = useFormikContext<FormValues>();    
    const { t } = useTranslation();
    const prefix = stepType === 'joint' ? 'joint_' : '';

    const handleRefferChange = (name: string, val: string) => {
        if (val === 'off') {
            setFieldValue(`${prefix}reffer_id`, '');
        }
    }

    useEffect(() => {
        setRefferId(formValues[`${prefix}reffer_id`] || Cookies.get('camp'));
    }, [])

    return (
        <>
            <div className='input_group'>
                <Checkbox name={`${prefix}reffer`} label={t("reffer_label")} onChange={handleRefferChange} setValue={refferId ? 'on' : 'off'} />
            </div>
            {
                formValues[`${prefix}reffer`] === 'on' && (
                    <div className='input_group'>
                        <Input type="text" label={t("reffer_id_label")} name={`${prefix}reffer_id`} setValue={refferId} />
                    </div>
                )
            }
        </>
    )
}

export default Reffer