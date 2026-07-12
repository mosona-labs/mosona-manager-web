import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, ExternalLink, Globe, RadioTower, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import ApiTeam, { type TeamPublicPageConfigType } from '@/api/team.ts';
import LoadingButton from '@/components/loading-button.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useUser } from '@/context/useUser.tsx';
import { ToastError } from '@/utils/toast.ts';

type FormErrors = {
    name?: string;
    domain?: string;
    title?: string;
    description?: string;
    customCSS?: string;
    general?: string;
};

const NAME_PATTERN = /^(?!-)[a-z0-9-]{3,32}(?<!-)$/;
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const normalizeValue = (value: string) => value.trim().toLowerCase();
const slugify = (value: string) =>
    normalizeValue(value)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const generateRandomPathName = (teamName?: string) => {
    const base = slugify(teamName || '').slice(0, 20) || 'status';
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    return `${base}-${randomSuffix}`.slice(0, 32).replace(/-+$/g, '');
};

const generateDefaultTitle = (
    t: (key: string, opts?: Record<string, string>) => string,
    teamName?: string
) => {
    const base = (teamName || t('pages.publicPage.statusPage')).trim();
    return t('pages.publicPage.defaultTitle', { name: base });
};

const generateDefaultDescription = (
    t: (key: string, opts?: Record<string, string>) => string,
    teamName?: string
) => {
    const base = (teamName || t('pages.publicPage.thisTeam')).trim();
    return t('pages.publicPage.defaultDescription', { name: base });
};

const validateName = (value: string, t: (key: string) => string) => {
    if (!value) return undefined;
    if (!NAME_PATTERN.test(value)) {
        return t('pages.publicPage.nameInvalid');
    }
    return undefined;
};

const validateDomain = (value: string, t: (key: string) => string) => {
    if (!value) return undefined;
    if (value.includes('://') || /[/?#@]/.test(value) || /\s/.test(value)) {
        return t('pages.publicPage.domainInvalidHost');
    }
    const labels = value.split('.');
    if (labels.some((label) => !label || !DOMAIN_LABEL_PATTERN.test(label))) {
        return t('pages.publicPage.domainInvalid');
    }
    return undefined;
};

const mapApiError = (msg?: string): FormErrors | null => {
    switch (msg) {
        case 'Invalid public page name':
        case 'Public page name is already in use':
            return { name: msg };
        case 'Invalid public page domain':
        case 'Public page domain is already in use':
            return { domain: msg };
        case 'At least one of name or domain is required when public page is enabled':
        case 'Invalid request format':
            return { general: msg };
        default:
            return null;
    }
};

const PreviewUrlAlert = ({ value }: { value?: string | null }) => {
    const { t } = useTranslation();
    const copyLink = () => {
        if (!value) return;
        navigator.clipboard
            .writeText(value)
            .then(() => {
                toast.success(t('pages.publicPage.linkCopied'));
            })
            .catch(() => {
                toast.error(t('pages.publicPage.copyFailed'), {
                    description: t('pages.publicPage.copyFailedDesc'),
                });
            });
    };

    return (
        <Alert>
            <AlertDescription>
                <div className="flex items-center gap-2 w-full">
                    <Globe />
                    <Input readOnly value={value ?? ''} />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={copyLink}
                        disabled={!value}
                    >
                        <Copy />
                    </Button>
                    {value ? (
                        <Button asChild variant="outline" size="icon-sm">
                            <a href={value} target="_blank" rel="noreferrer">
                                <ExternalLink />
                            </a>
                        </Button>
                    ) : (
                        <Button type="button" variant="outline" size="icon-sm" disabled>
                            <ExternalLink />
                        </Button>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
};

const PublicPage = () => {
    const { t } = useTranslation();
    const { team } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [urlByName, setUrlByName] = useState<string | null>(null);
    const [urlByDomain, setUrlByDomain] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [customCSS, setCustomCSS] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});

    const applyConfig = (config: TeamPublicPageConfigType) => {
        setEnabled(config.enabled);
        setName(config.name ?? '');
        setDomain(config.domain ?? '');
        setUrlByName(config.url_by_name ?? null);
        setUrlByDomain(config.url_by_domain ?? null);
        setTitle(config.title ?? '');
        setDescription(config.description ?? '');
        setCustomCSS(config.custom_css ?? '');
        setErrors({});
    };

    useEffect(() => {
        if (!team) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        ApiTeam.getPublicPage()
            .then((res) => {
                applyConfig(res.data);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    }, [team?.id]);

    useEffect(() => {
        let fadeInTimer: number | undefined;
        let fadeOutTimer: number | undefined;

        if (isLoading) {
            setShowSkeleton(true);
            setMounted(false);
        } else {
            fadeInTimer = window.setTimeout(() => setMounted(true), 60);
            fadeOutTimer = window.setTimeout(() => setShowSkeleton(false), 420);
        }

        return () => {
            if (fadeInTimer) window.clearTimeout(fadeInTimer);
            if (fadeOutTimer) window.clearTimeout(fadeOutTimer);
        };
    }, [isLoading]);

    const submitPublicPage = (overrides?: { name?: string; domain?: string }) => {
        const nextName = overrides?.name ?? name;
        const nextDomain = overrides?.domain ?? domain;
        const normalizedName = normalizeValue(nextName);
        const normalizedDomain = normalizeValue(nextDomain);
        const normalizedTitle = title.trim();
        const normalizedDescription = description.trim();
        const nextCustomCSS = customCSS;
        const nextEnabled = enabled && (!!normalizedName || !!normalizedDomain);

        const nextErrors: FormErrors = nextEnabled
            ? {
                  name: validateName(normalizedName, t),
                  domain: validateDomain(normalizedDomain, t),
              }
            : {};

        if (nextEnabled && !normalizedName && !normalizedDomain) {
            nextErrors.general = t('pages.publicPage.nameOrDomainRequired');
        }

        if (nextErrors.name || nextErrors.domain || nextErrors.general) {
            setErrors(nextErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        ApiTeam.updatePublicPage({
            enabled: nextEnabled,
            name: normalizedName || undefined,
            domain: normalizedDomain || undefined,
            title: normalizedTitle || undefined,
            description: normalizedDescription || undefined,
            custom_css: nextCustomCSS.trim() ? nextCustomCSS : undefined,
        })
            .then((res) => {
                applyConfig(res.data);
                toast.success(t('pages.publicPage.updateSuccess'), {
                    description: t('pages.publicPage.updated'),
                });
            })
            .catch((err) => {
                const apiErrors = mapApiError(err.response?.data?.msg);
                if (apiErrors) {
                    setErrors(apiErrors);
                    return;
                }
                ToastError(err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const onSave = () => submitPublicPage();

    const onClearName = () => {
        setName('');
        submitPublicPage({ name: '' });
    };

    const onClearDomain = () => {
        setDomain('');
        submitPublicPage({ domain: '' });
    };

    if (!team && !isLoading) {
        return (
            <div className="w-full p-5 h-full overflow-y-auto pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('pages.publicPage.title')}</CardTitle>
                        <CardDescription>{t('pages.publicPage.noTeam')}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 relative">
            {showSkeleton ? (
                <div
                    className="absolute inset-5 z-40 pointer-events-none overflow-hidden transition-opacity duration-400"
                    style={{ opacity: isLoading ? 1 : 0 }}
                >
                    <div className="flex flex-row justify-between items-center mb-3">
                        <div>
                            <div className="h-8 w-36 rounded bg-muted-foreground/10 animate-pulse" />
                            <div className="mt-2 h-4 w-[32rem] rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                        <div className="h-10 w-32 rounded bg-muted-foreground/8 animate-pulse" />
                    </div>
                    <div className="grid gap-3 mb-4">
                        <div className="h-14 rounded bg-muted-foreground/8 animate-pulse" />
                        <div className="h-14 rounded bg-muted-foreground/8 animate-pulse" />
                    </div>
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <div className="h-6 w-56 rounded bg-muted-foreground/10 animate-pulse" />
                            <div className="h-4 w-96 rounded bg-muted-foreground/8 animate-pulse" />
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="h-20 rounded bg-muted-foreground/8 animate-pulse" />
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="h-28 rounded bg-muted-foreground/8 animate-pulse" />
                                <div className="h-28 rounded bg-muted-foreground/8 animate-pulse" />
                            </div>
                            <div className="grid gap-4">
                                <div className="h-28 rounded bg-muted-foreground/8 animate-pulse" />
                                <div className="h-36 rounded bg-muted-foreground/8 animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : null}

            <div style={{ transition: 'opacity 400ms ease', opacity: mounted ? 1 : 0 }}>
                <div
                    className="flex flex-row justify-between items-center mb-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(6px)',
                    }}
                >
                    <div>
                        <h1 className="text-2xl font-bold">{t('pages.publicPage.title')}</h1>
                        <p className="opacity-65">{t('pages.publicPage.description')}</p>
                    </div>
                    <LoadingButton isLoading={isSubmitting || isLoading} onClick={onSave}>
                        {t('pages.publicPage.save')}
                    </LoadingButton>
                </div>

                {enabled && (urlByName || urlByDomain) && (
                    <div
                        className="grid gap-3 mb-4"
                        style={{
                            transition: 'opacity 400ms ease, transform 400ms ease',
                            transitionDelay: '80ms',
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(8px)',
                        }}
                    >
                        {urlByName && <PreviewUrlAlert value={urlByName} />}
                        {urlByDomain && <PreviewUrlAlert value={urlByDomain} />}
                    </div>
                )}

                <Card
                    className="border-border bg-card"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        transitionDelay: '120ms',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(8px)',
                    }}
                >
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <RadioTower className="h-5 w-5 text-primary" />
                            {t('pages.publicPage.configTitle')}
                        </CardTitle>
                        <CardDescription>{t('pages.publicPage.configDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                            <div className="grid gap-1">
                                <Label htmlFor="public-page-enabled">
                                    {t('pages.publicPage.enable')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('pages.publicPage.enableHint')}
                                </p>
                            </div>
                            <Switch
                                id="public-page-enabled"
                                checked={enabled}
                                disabled={isLoading || isSubmitting}
                                onCheckedChange={(checked) => {
                                    setEnabled(checked);
                                    if (checked && !normalizeValue(name)) {
                                        setName(generateRandomPathName(team?.name));
                                    }
                                    if (checked) {
                                        if (!title) setTitle(generateDefaultTitle(t, team?.name));
                                        if (!description)
                                            setDescription(
                                                generateDefaultDescription(t, team?.name)
                                            );
                                    }
                                    setErrors({});
                                }}
                            />
                        </div>

                        {enabled && (
                            <>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="public-page-name">
                                            {t('pages.publicPage.pathName')}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="public-page-name"
                                                placeholder="acme-status"
                                                value={name}
                                                disabled={isLoading || isSubmitting}
                                                aria-invalid={!!errors.name}
                                                onChange={(e) => {
                                                    setName(e.target.value);
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        name: undefined,
                                                        general: undefined,
                                                    }));
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                disabled={isLoading || isSubmitting || !name}
                                                onClick={onClearName}
                                                aria-label={t('pages.publicPage.clearPath')}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('pages.publicPage.pathHint')}
                                        </p>
                                        {errors.name && (
                                            <p className="text-sm text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="public-page-domain">
                                            {t('pages.publicPage.customDomain')}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="public-page-domain"
                                                placeholder="status.example.com"
                                                value={domain}
                                                disabled={isLoading || isSubmitting}
                                                aria-invalid={!!errors.domain}
                                                onChange={(e) => {
                                                    setDomain(e.target.value);
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        domain: undefined,
                                                        general: undefined,
                                                    }));
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                disabled={isLoading || isSubmitting || !domain}
                                                onClick={onClearDomain}
                                                aria-label={t('pages.publicPage.clearDomain')}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t('pages.publicPage.domainHint')}
                                        </p>
                                        {errors.domain && (
                                            <p className="text-sm text-destructive">
                                                {errors.domain}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="public-page-title">
                                            {t('pages.publicPage.pageTitle')}
                                        </Label>
                                        <Input
                                            id="public-page-title"
                                            placeholder="Acme Status"
                                            value={title}
                                            disabled={isLoading || isSubmitting}
                                            aria-invalid={!!errors.title}
                                            onChange={(e) => {
                                                setTitle(e.target.value);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    title: undefined,
                                                }));
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('pages.publicPage.titleHint')}
                                        </p>
                                        {errors.title && (
                                            <p className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="public-page-description">
                                            {t('pages.publicPage.pageDescription')}
                                        </Label>
                                        <Textarea
                                            id="public-page-description"
                                            placeholder="The public status page for Acme."
                                            value={description}
                                            disabled={isLoading || isSubmitting}
                                            aria-invalid={!!errors.description}
                                            onChange={(e) => {
                                                setDescription(e.target.value);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    description: undefined,
                                                }));
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('pages.publicPage.descriptionHint')}
                                        </p>
                                        {errors.description && (
                                            <p className="text-sm text-destructive">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="public-page-custom-css">
                                            {t('pages.publicPage.customCss')}
                                        </Label>
                                        <Textarea
                                            id="public-page-custom-css"
                                            placeholder={`#root {\n  background: #22c55e;\n}`}
                                            value={customCSS}
                                            disabled={isLoading || isSubmitting}
                                            aria-invalid={!!errors.customCSS}
                                            className="min-h-33 font-mono text-sm"
                                            spellCheck={false}
                                            onChange={(e) => {
                                                setCustomCSS(e.target.value);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    customCSS: undefined,
                                                }));
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('pages.publicPage.customCssHint')}
                                        </p>
                                        {errors.customCSS && (
                                            <p className="text-sm text-destructive">
                                                {errors.customCSS}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {errors.general && (
                                    <p className="text-sm text-destructive">{errors.general}</p>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PublicPage;
