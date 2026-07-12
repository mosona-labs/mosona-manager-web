import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import es from './locales/es';
import zhCN from './locales/zh-CN';
import zhHK from './locales/zh-HK';

export const supportedLanguages = ['en', 'zh-CN', 'zh-HK', 'es'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export type LanguageMeta = {
    code: SupportedLanguage;
    name: string;
    flag: string;
};

export const languageMeta: Record<SupportedLanguage, LanguageMeta> = {
    en: { code: 'en', name: 'English', flag: '🇺🇸' },
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    'zh-CN': { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    'zh-HK': { code: 'zh-HK', name: '繁體中文', flag: '🇭🇰' },
};

export const languageNames: Record<SupportedLanguage, string> = {
    en: languageMeta.en.name,
    es: languageMeta.es.name,
    'zh-CN': languageMeta['zh-CN'].name,
    'zh-HK': languageMeta['zh-HK'].name,
};

export const sortedLanguages = [...supportedLanguages].sort((a, b) =>
    languageMeta[a].name.localeCompare(languageMeta[b].name, 'en', { sensitivity: 'base' })
);

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            'zh-CN': { translation: zhCN },
            'zh-HK': { translation: zhHK },
            es: { translation: es },
        },
        fallbackLng: 'en',
        supportedLngs: supportedLanguages,
        nonExplicitSupportedLngs: false,
        load: 'currentOnly',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: 'mosona-language',
            caches: ['localStorage'],
            convertDetectedLanguage: (language) => {
                const normalized = language.toLowerCase();
                if (normalized === 'zh-hk' || normalized === 'zh-tw' || normalized === 'zh-mo') {
                    return 'zh-HK';
                }
                if (normalized.startsWith('zh')) return 'zh-CN';
                if (normalized.startsWith('es')) return 'es';
                return 'en';
            },
        },
        react: { useSuspense: false },
    });

i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language;
});

document.documentElement.lang = i18n.resolvedLanguage || 'en';

export default i18n;
