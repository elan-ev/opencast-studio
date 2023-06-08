import i18n, { CustomTypeOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';
import elTranslations from './locales/el.json';
import esTranslations from './locales/es.json';
import faTranslations from './locales/fa.json';
import frTranslations from './locales/fr.json';
import nlTranslations from './locales/nl.json';
import slTranslations from './locales/sl.json';
import trTranslations from './locales/tr.json';
import zhTranslations from './locales/zh.json';

const resources = {
  en: { translation: enTranslations },
  de: { translation: deTranslations },
  el: { translation: elTranslations },
  es: { translation: esTranslations },
  fa: { translation: faTranslations },
  fr: { translation: frTranslations },
  nl: { translation: nlTranslations },
  sl: { translation: slTranslations },
  tr: { translation: trTranslations },
  zh: { translation: zhTranslations },
};

export type TranslationKey = keyof CustomTypeOptions['resources']['translation'];

void i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (format === 'duration-seconds') {
          if (value == null) {
            return '-:--:--';
          }

          const seconds = value % 60;
          value /= 60;
          const minutes = Math.floor(value % 60);
          value /= 60;
          const hours = Math.floor(value % 60);

          const secondsString = seconds.toLocaleString(lng, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          });
          const result = [
            `${(minutes < 10 ? '0' : '')} + ${minutes}`,
            `${(seconds < 10 ? '0' : '')} + ${secondsString}`,
          ];
          if (hours > 0) {
            result.unshift(hours.toString());
          }

          return result.join(':');
        } else {
          return value;
        }
      },
    },

    detection: {
      order: ['localStorage', 'navigator'],
    },
  });

export default i18n;
