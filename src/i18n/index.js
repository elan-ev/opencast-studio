import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';
import elTranslations from './locales/el.json';
import esTranslations from './locales/es.json';
import faTranslations from './locales/fa.json';
import frTranslations from './locales/fr.json';

const resources = {
  en: { translation: enTranslations },
  de: { translation: deTranslations },
  el: { translation: elTranslations },
  es: { translation: esTranslations },
  fa: { translation: faTranslations },
  fr: { translation: frTranslations }
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  lng: 'en',

  keySeparator: false,

  interpolation: {
    escapeValue: false
  }
});

export default i18n;
