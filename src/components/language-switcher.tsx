import { Check, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    languageMeta,
    sortedLanguages,
    type SupportedLanguage,
} from '@/i18n';
import { cn } from '@/lib/utils';

const LanguageSwitcher = ({ compact = true }: { compact?: boolean }) => {
    const { i18n, t } = useTranslation();
    const current = (i18n.resolvedLanguage || 'en') as SupportedLanguage;
    const currentMeta = languageMeta[current] || languageMeta.en;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    aria-label={t('common.language')}
                    title={t('common.language')}
                >
                    <Languages />
                    {!compact && (
                        <span className="flex min-w-0 items-center gap-1.5">
                            <span className="leading-none">{currentMeta.flag}</span>
                            <span className="truncate">{currentMeta.name}</span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                collisionPadding={12}
                className={cn(
                    'max-h-[min(24rem,var(--radix-dropdown-menu-content-available-height))]',
                    'w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)]',
                    'overflow-x-hidden overflow-y-auto p-2'
                )}
            >
                <DropdownMenuLabel className="sticky top-0 z-10 bg-popover px-1.5 pb-2">
                    {t('common.language')}
                </DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-1">
                    {sortedLanguages.map((language) => {
                        const meta = languageMeta[language];
                        const selected = current === language;

                        return (
                            <button
                                key={language}
                                type="button"
                                onClick={() => void i18n.changeLanguage(language)}
                                className={cn(
                                    'flex min-w-0 items-center gap-1.5 rounded-md px-2 py-2 text-left text-sm outline-hidden transition-colors',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    'focus-visible:bg-accent focus-visible:text-accent-foreground',
                                    selected && 'bg-accent/70 text-accent-foreground'
                                )}
                            >
                                <span className="shrink-0 text-base leading-none" aria-hidden>
                                    {meta.flag}
                                </span>
                                <span className="min-w-0 flex-1 truncate leading-tight">
                                    {meta.name}
                                </span>
                                <span className="flex h-4 w-3.5 shrink-0 items-center justify-center">
                                    {selected && <Check size={14} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;
