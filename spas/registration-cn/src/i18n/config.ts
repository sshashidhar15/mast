import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: window['currentLocale'] === 'cn' ? 'cn' : 'en',
  resources: {
    en: {
      translations: require('./locales/en.json')
    },
    cn: {
      translations: require('./locales/cn.json')
    }
  },
  ns: ['translations'],
  defaultNS: 'translations'
});

i18n.languages = ['en', 'zh'];

export default i18n;