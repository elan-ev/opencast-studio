import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: { en: {}, de: {} },
  lng: 'en',
  fallbackLng: 'en',
  // have a common namespace used around the full app
  ns: ['translations'],
  defaultNS: 'translations',
  debug: false,
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
