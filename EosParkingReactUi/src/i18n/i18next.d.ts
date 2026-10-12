import 'i18next';
import fa from '../locales/fa';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof fa };
    returnNull: false;
  }
}
