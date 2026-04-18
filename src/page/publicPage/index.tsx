import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Globe, RadioTower } from 'lucide-react';
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

const generateDefaultTitle = (teamName?: string) => {
    const base = (teamName || 'Status Page').trim();
    return `${base} Status`;
};

const generateDefaultDescription = (teamName?: string) => {
    const base = (teamName || 'This team').trim();
    return `The public status page for ${base}.`;
};

const validateName = (value: string) => {
    if (!value) return undefined;
    if (!NAME_PATTERN.test(value)) {
        return 'Use 3-32 lowercase letters, numbers, or hyphens. Hyphens cannot be at the start or end.';
    }
    return undefined;
};

const validateDomain = (value: string) => {
    if (!value) return undefined;
    if (value.includes('://') || /[/?#@]/.test(value) || /\s/.test(value)) {
        return 'Enter a host only, without https://, paths, queries, fragments, or @.';
    }
    const labels = value.split('.');
    if (labels.some((label) => !label || !DOMAIN_LABEL_PATTERN.test(label))) {
        return 'Enter a valid hostname, such as status.example.com.';
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
    const copyLink = () => {
        if (!value) return;
        navigator.clipboard
            .writeText(value)
            .then(() => {
                toast.success('Link copied to clipboard.');
            })
            .catch(() => {
                toast.error('Copy failed', {
                    description: 'Unable to copy the link to your clipboard.',
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
    const { team } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [enabled, setEnabled] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [urlByName, setUrlByName] = useState<string | null>(null);
    const [urlByDomain, setUrlByDomain] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});

    const applyConfig = (config: TeamPublicPageConfigType) => {
        setEnabled(config.enabled);
        setName(config.name ?? '');
        setDomain(config.domain ?? '');
        setUrlByName(config.url_by_name ?? null);
        setUrlByDomain(config.url_by_domain ?? null);
        setTitle(config.title ?? '');
        setDescription(config.description ?? '');
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

    const onSave = () => {
        const normalizedName = normalizeValue(name);
        const normalizedDomain = normalizeValue(domain);
        const normalizedTitle = title.trim();
        const normalizedDescription = description.trim();

        const nextErrors: FormErrors = enabled
            ? {
                  name: validateName(normalizedName),
                  domain: validateDomain(normalizedDomain),
              }
            : {};

        if (enabled && !normalizedName && !normalizedDomain) {
            nextErrors.general =
                'At least one of name or domain is required when public page is enabled.';
        }

        if (nextErrors.name || nextErrors.domain || nextErrors.general) {
            setErrors(nextErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        ApiTeam.updatePublicPage({
            enabled,
            name: normalizedName || undefined,
            domain: normalizedDomain || undefined,
            title: normalizedTitle || undefined,
            description: normalizedDescription || undefined,
        })
            .then((res) => {
                applyConfig(res.data);
                toast.success('Update Success', {
                    description: 'Public page settings have been updated successfully.',
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

    if (!team && !isLoading) {
        return (
            <div className="w-full p-5 h-full overflow-y-auto pb-24">
                <Card>
                    <CardHeader>
                        <CardTitle>Public Page</CardTitle>
                        <CardDescription>
                            Create or switch to a team to manage this page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">Public Page</h1>
                    <p className="opacity-65">
                        Manage your public status page — set the path, custom domain, title, and
                        description.
                    </p>
                </div>
                <LoadingButton isLoading={isSubmitting || isLoading} onClick={onSave}>
                    Save Changes
                </LoadingButton>
            </div>

            {enabled && (urlByName || urlByDomain) && (
                <div className="grid gap-3 mb-4">
                    {urlByName && <PreviewUrlAlert value={urlByName} />}
                    {urlByDomain && <PreviewUrlAlert value={urlByDomain} />}
                </div>
            )}

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <RadioTower className="h-5 w-5 text-primary" />
                        Public Page Configuration
                    </CardTitle>
                    <CardDescription>
                        Enable a shareable status page and manage its path-based name or custom
                        domain.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                        <div className="grid gap-1">
                            <Label htmlFor="public-page-enabled">Enable public page</Label>
                            <p className="text-sm text-muted-foreground">
                                When disabled, existing links stay saved but the public page is not
                                served.
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
                                    if (!title) setTitle(generateDefaultTitle(team?.name));
                                    if (!description)
                                        setDescription(generateDefaultDescription(team?.name));
                                }
                                setErrors({});
                            }}
                        />
                    </div>

                    {enabled && (
                        <>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="public-page-name">Path name</Label>
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
                                    <p className="text-xs text-muted-foreground">
                                        3-32 chars, lowercase letters, numbers, and hyphens only.
                                    </p>
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="public-page-domain">Custom domain</Label>
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
                                    <p className="text-xs text-muted-foreground">
                                        Host only. Do not include https://, paths, query strings, or
                                        @.
                                    </p>
                                    {errors.domain && (
                                        <p className="text-sm text-destructive">{errors.domain}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="public-page-title">Title</Label>
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
                                        The title shown on the public status page.
                                    </p>
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="public-page-description">Description</Label>
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
                                        A short description shown on the public status page.
                                    </p>
                                    {errors.description && (
                                        <p className="text-sm text-destructive">
                                            {errors.description}
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
    );
};

export default PublicPage;
