import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';

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
    'de',
    'ko',
    'ms',
] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export type LanguageMeta = {
    code: SupportedLanguage;
    name: string;
    flag: string;
};

export const languageMeta: Record<SupportedLanguage, LanguageMeta> = {
    ar: { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    en: { code: 'en', name: 'English', flag: '🇬🇧' },
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
    ko: { code: 'ko', name: '한국어', flag: '🇰🇷' },
    ms: { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
    pt: { code: 'pt', name: 'Português', flag: '🇧🇷' },
    ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    'zh-CN': { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    'zh-HK': { code: 'zh-HK', name: '繁體中文', flag: '🇭🇰' },
};

// Fixed display order: Latin Romance/Germanic first, then Malay, Slavic, CJK, Arabic
export const sortedLanguages: SupportedLanguage[] = [
    'en',
    'es',
    'fr',
    'pt',
    'de',
    'ms',
    'ru',
    'ar',
    'ja',
    'ko',
    'zh-CN',
    'zh-HK',
];

export const rtlLanguages = new Set<SupportedLanguage>(['ar']);

export const isRTLLanguage = (language: string): boolean =>
    rtlLanguages.has(language as SupportedLanguage);

const localeLoaders: Record<
    Exclude<SupportedLanguage, 'en'>,
    () => Promise<{ default: typeof en }>
> = {
    ar: () => import('./locales/ar'),
    de: () => import('./locales/de'),
    es: () => import('./locales/es'),
    fr: () => import('./locales/fr'),
    ja: () => import('./locales/ja'),
    ko: () => import('./locales/ko'),
    ms: () => import('./locales/ms'),
    pt: () => import('./locales/pt'),
    ru: () => import('./locales/ru'),
    'zh-CN': () => import('./locales/zh-CN'),
    'zh-HK': () => import('./locales/zh-HK'),
};

const loadedLanguages = new Set<SupportedLanguage>(['en']);
const loadingLanguages = new Map<SupportedLanguage, Promise<void>>();
let arabicFontPromise: Promise<void> | null = null;

async function ensureArabicFont() {
    if (!arabicFontPromise) {
        // @ts-ignore
        arabicFontPromise = import('@fontsource-variable/noto-sans-arabic').then(() => undefined);
    }
    await arabicFontPromise;
}

export function isSupportedLanguage(language: string): language is SupportedLanguage {
    return (supportedLanguages as readonly string[]).includes(language);
}

export function normalizeLanguage(language: string): SupportedLanguage {
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
    if (normalized.startsWith('de')) return 'de';
    if (normalized.startsWith('ko')) return 'ko';
    if (normalized.startsWith('ms') || normalized.startsWith('id')) return 'ms';
    if (isSupportedLanguage(language)) return language;
    return 'en';
}

export async function loadLanguage(language: string): Promise<SupportedLanguage> {
    const lng = normalizeLanguage(language);

    if (lng === 'ar') {
        void ensureArabicFont();
    }

    if (loadedLanguages.has(lng) || lng === 'en') {
        loadedLanguages.add(lng);
        if (lng === 'ar') await ensureArabicFont();
        return lng;
    }

    const pending = loadingLanguages.get(lng);
    if (pending) {
        await pending;
        if (lng === 'ar') await ensureArabicFont();
        return lng;
    }

    const loadPromise = Promise.all([
        localeLoaders[lng]().then((module) => {
            i18n.addResourceBundle(lng, 'translation', module.default, true, true);
            loadedLanguages.add(lng);
        }),
        lng === 'ar' ? ensureArabicFont() : Promise.resolve(),
    ]).finally(() => {
        loadingLanguages.delete(lng);
    });

    loadingLanguages.set(
        lng,
        loadPromise.then(() => undefined)
    );
    await loadPromise;
    return lng;
}

export const LANGUAGE_STORAGE_KEY = 'mosona-language';

export function getStoredLanguage(): SupportedLanguage | null {
    try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (!stored) return null;
        return normalizeLanguage(stored);
    } catch {
        return null;
    }
}

export function setStoredLanguage(language: SupportedLanguage) {
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
        // ignore storage failures (private mode, etc.)
    }
}

function detectBrowserLanguage(): SupportedLanguage {
    if (typeof navigator === 'undefined') return 'en';

    const candidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean);

    for (const candidate of candidates) {
        const normalized = normalizeLanguage(candidate);
        // Prefer an exact-family match when browser reports a supported language family
        if (normalized !== 'en' || candidate.toLowerCase().startsWith('en')) {
            return normalized;
        }
    }

    return 'en';
}

export function resolvePreferredLanguage(): SupportedLanguage {
    return getStoredLanguage() ?? detectBrowserLanguage();
}

export async function changeLanguage(language: string): Promise<string> {
    const lng = await loadLanguage(language);
    setStoredLanguage(lng);
    await i18n.changeLanguage(lng);
    return lng;
}

function updateDocumentDirection(language: string) {
    document.documentElement.dir = isRTLLanguage(language) ? 'rtl' : 'ltr';
}

void i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
        },
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: supportedLanguages,
        nonExplicitSupportedLngs: false,
        load: 'currentOnly',
        partialBundledLanguages: true,
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    })
    .then(async () => {
        // Manual preference (localStorage) wins; otherwise infer from browser once.
        const preferred = resolvePreferredLanguage();
        await loadLanguage(preferred);
        if (i18n.language !== preferred) {
            await i18n.changeLanguage(preferred);
        }
        document.documentElement.lang = preferred;
        updateDocumentDirection(preferred);
    });

i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language;
    updateDocumentDirection(language);
});
