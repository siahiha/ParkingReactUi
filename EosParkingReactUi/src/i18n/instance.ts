import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fa from '../locales/fa';
import en from '../locales/en';

export const i18nInstance = i18n;

if (!i18n.isInitialized) {
  void i18n
    .use(initReactI18next)
    .init({
      resources: { fa: { translation: fa }, en: { translation: en } },
      lng: 'fa',
      fallbackLng: 'en',
      supportedLngs: ['fa', 'en'],
      defaultNS: 'translation',
      interpolation: { escapeValue: false },
      returnNull: false,
    });
}

export default i18nInstance;
