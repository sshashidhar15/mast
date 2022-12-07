import React, { useEffect, useState, useMemo} from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { TradPlatform } from '../../types/FeedData';
import { SelectButtonSetting } from '../../types/FormControls';
import SelectButtons from '../form-controls/SelectButtons';
import DropdownSelect from '../form-controls/DropdownSelect';
import { SelectItem } from '../../types/FormControls';
import { FormValues } from '../../types/FormValues';
import MT5 from '../../assets/images/mt5-ico.svg';
import MT4 from '../../assets/images/mt4-ico.svg';
import cTrader from '../../assets/images/ctrader-ico.svg';

interface Step3RawProps {
    stepType: 'individual' | 'joint'
}

const Step3Raw: React.FC<Step3RawProps> = ({stepType}) => {
    const { data } = useTypedSelector(state => state.feed);
    const form = useTypedSelector(state => state.form);
    const { defaultTradePlatform, defaultTradeAccountType, defaultCurrency } = useTypedSelector(state => state.app);

    const [ platforms, setPlatforms ] = useState<SelectButtonSetting[]>([]);
    const [ accountTypes, setAccountTypes ] = useState<SelectButtonSetting[]>([]);
    const [ currencies, setCurrencies ] = useState<SelectItem[]>([]);

    const { setFieldValue, setFieldTouched } = useFormikContext<FormValues>();   
    
    const { t } = useTranslation();

    const prefix = stepType === 'joint' ? 'joint_' : '';

    const tradePlatforms: TradPlatform[] = useMemo(() => {
        let res;
        if (form.values.islamic === 'on') {
            res = data.tradePlatformsIslamic.filter(t => t.branch === window['currentBranchID']);
        } else {
            res = data.tradePlatforms.filter(t => t.branch === window['currentBranchID']);
        }

        return res.length === 0 ? [] : res[0].tradePlatforms;
    }, [data, form.values.islamic])

    const currenciesList = useMemo(() => {
        const branchedCurrenciesList = data.currenciesList.filter(c => c.branch === window['currentBranchID'])[0];
        if (form.values.islamic === 'on') {
            return branchedCurrenciesList.items.filter(i => i.islamic);
        } else {
            return branchedCurrenciesList.items;
        }        
    }, [data, form.values.islamic])

    useEffect(() => {
        if (tradePlatforms.length === 0) return;

        setPlatforms(tradePlatforms.map(el => ({
            value: el.id,
            background: el.name === 'MT5' ? MT5 : el.name === 'MT4' ? MT4 : el.name === 'cTrader' ? cTrader : null,
            default: el.name === defaultTradePlatform ? true : false
        })).sort((a, b) => a.default ? -1 : 1));

        setAccountTypes(tradePlatforms.filter(t => t.name === 'MT5')[0].accountTypes.map(a => ({
            value: a.id,
            label: t(a.name.toLowerCase().split(' ').join('_')),
            default: a.name === defaultTradeAccountType ? true : false
        })))

        setCurrencies(currenciesList.map((c) => ({
            id: c.id,
            value: c.id,
            label: c.name,
        })))
    }, [])

    const handlePlatformChange = (name: string, val: string) => {
        setAccountTypes(tradePlatforms.filter(t => t.id === val)[0].accountTypes.map(a => ({
            value: a.id,
            label: t(a.name.toLowerCase().split(' ').join('_'))
        })))

        setFieldValue(`${prefix}account_type`, '');
        setFieldTouched(`${prefix}account_type`, false, false);        
    }
    
    return (
        <>
            <div className="input_group">
                <SelectButtons label={t("trading_platform_label")} name={`${prefix}trading_platform`} options={platforms} size="large" type="normal" onChange={handlePlatformChange} />
            </div>
            <div className="input_group">
                <SelectButtons label={t("account_type_label")} name={`${prefix}account_type`} options={accountTypes} size="large" type="normal" />
            </div>
            <div className="input_group">
                <DropdownSelect label={t("currency_label")} name={`${prefix}currency`} placeholder="" allowInput={false} items={currencies} maxHeight={400} setValue={defaultCurrency} />
            </div>
        </>
      )
}

export default Step3Raw