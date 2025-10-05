import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import i18n from '../i18n';

const STORAGE_KEY = 'preferredLanguage';

export type SupportedLanguage = 'en' | 'pt-BR';

interface LanguageContextValue {
    language: SupportedLanguage;
    setLanguage: (language: SupportedLanguage) => void;
}

interface LanguageOption {
    value: SupportedLanguage;
    label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { value: 'en', label: 'English' },
    { value: 'pt-BR', label: 'Português (Brasil)' },
];

const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS.map(option => option.value);

const isSupportedLanguage = (value: unknown): value is SupportedLanguage =>
    typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);

const getStoredLanguage = (): SupportedLanguage | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isSupportedLanguage(stored) ? stored : null;
    } catch (error) {
        console.warn('Unable to read preferred language from storage', error);
        return null;
    }
};

const detectBrowserLanguage = (): SupportedLanguage | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    const candidates: string[] = [];
    if (Array.isArray(window.navigator.languages)) {
        candidates.push(...window.navigator.languages);
    }
    if (typeof window.navigator.language === 'string') {
        candidates.push(window.navigator.language);
    }

    for (const candidate of candidates) {
        if (typeof candidate !== 'string') {
            continue;
        }
        const normalized = candidate.toLowerCase();
        if (normalized.startsWith('pt')) {
            return 'pt-BR';
        }
        if (normalized.startsWith('en')) {
            return 'en';
        }
    }

    return null;
};

const getInitialLanguage = (): SupportedLanguage => {
    const stored = getStoredLanguage();
    if (stored) {
        return stored;
    }

    const detected = detectBrowserLanguage();
    if (detected) {
        return detected;
    }

    const current = i18n.language;
    if (isSupportedLanguage(current)) {
        return current;
    }

    return 'en';
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<SupportedLanguage>(() => getInitialLanguage());

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', language);
        }

        void i18n.changeLanguage(language).catch(error => {
            console.warn('Unable to change app language', error);
        });

        if (typeof window === 'undefined') {
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, language);
        } catch (error) {
            console.warn('Unable to persist preferred language', error);
        }
    }, [language]);

    const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
        setLanguageState(prev => (prev === nextLanguage ? prev : nextLanguage));
    }, []);

    const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
