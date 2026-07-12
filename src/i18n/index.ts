import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar';
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import ja from './locales/ja';
import pt from './locales/pt';
import ru from './locales/ru';
import zhCN from './locales/zh-CN';
import zhHK from './locales/zh-HK';

export const supportedLanguages = [
    'en',
    'zh-CN',
    'zh-HK',
    'es',
    'fr',
    'ja',
    'pt',
    'ru',
    'ar',
] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export type LanguageMeta = {
    code: SupportedLanguage;
    name: string;
    flag: string;
};

export const languageMeta: Record<SupportedLanguage, LanguageMeta> = {
    en: { code: 'en', name: 'English', flag: '🇺🇸' },
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
    pt: { code: 'pt', name: 'Português', flag: '🇧🇷' },
    ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    'zh-CN': { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    'zh-HK': { code: 'zh-HK', name: '繁體中文', flag: '🇭🇰' },
    ar: { code: 'ar', name: 'العربية', flag: '🇸🇦' },
};

export const languageNames: Record<SupportedLanguage, string> = {
    en: languageMeta.en.name,
    es: languageMeta.es.name,
    fr: languageMeta.fr.name,
    ja: languageMeta.ja.name,
    pt: languageMeta.pt.name,
    ru: languageMeta.ru.name,
    'zh-CN': languageMeta['zh-CN'].name,
    'zh-HK': languageMeta['zh-HK'].name,
    ar: languageMeta.ar.name,
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
            fr: { translation: fr },
            ja: { translation: ja },
            pt: { translation: pt },
            ru: { translation: ru },
            ar: { translation: ar },
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
                if (normalized.startsWith('fr')) return 'fr';
                if (normalized.startsWith('ja')) return 'ja';
                if (normalized.startsWith('pt')) return 'pt';
                if (normalized.startsWith('ru')) return 'ru';
                if (normalized.startsWith('ar')) return 'ar';
                return 'en';
            },
        },
        react: { useSuspense: false },
    });

export const rtlLanguages = new Set<SupportedLanguage>(['ar']);

export const isRTLLanguage = (language: string): boolean =>
    rtlLanguages.has(language as SupportedLanguage);

function updateDocumentDirection(language: string) {
    document.documentElement.dir = isRTLLanguage(language) ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language;
    updateDocumentDirection(language);
});

const initialLanguage = i18n.resolvedLanguage || 'en';
document.documentElement.lang = initialLanguage;
updateDocumentDirection(initialLanguage);

export default i18n;
