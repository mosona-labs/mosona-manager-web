import { Check, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { languageNames, supportedLanguages, type SupportedLanguage } from '@/i18n';

const LanguageSwitcher = ({ compact = true }: { compact?: boolean }) => {
    const { i18n, t } = useTranslation();
    const current = (i18n.resolvedLanguage || 'en') as SupportedLanguage;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    aria-label={t('common.language')}
                    title={t('common.language')}
                >
                    <Languages />
                    {!compact && <span>{languageNames[current] || languageNames.en}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('common.language')}</DropdownMenuLabel>
                {supportedLanguages.map((language) => (
                    <DropdownMenuItem
                        key={language}
                        onClick={() => void i18n.changeLanguage(language)}
                    >
                        <span className="w-4">{current === language && <Check size={16} />}</span>
                        {languageNames[language]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;
