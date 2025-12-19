import { Bell, Plus, X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { toast } from 'sonner';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import ShoutrrrUrlItem from '@/page/settings/components/shoutrrr.tsx';
import ApiNotification, { type NotificationType } from '@/api/notification.tsx';
import { ToastError } from '@/utils/toast.ts';
import LoadingButton from '@/components/loading-button.tsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

const NotificationSettings = () => {
    const [emails, setEmails] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const test = emailRegex.test(email);
        if (!test) {
            toast.warning('Invalid email address.', {
                description: 'Please enter a valid email address.',
            });
        }

        return test;
    };
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const email = inputValue.trim();

            if (validateEmail(email) && !emails.includes(email)) {
                setEmails([...emails, email]);
                setInputValue('');
            }
        }
    };
    const removeEmail = (emailToRemove: string) => {
        setEmails(emails.filter((email) => email !== emailToRemove));
    };

    const [shoutrrrUrls, setShoutrrrUrls] = useState<string[]>(['']);
    const addShoutrrrUrl = (url: string) => {
        if (shoutrrrUrls.length === 1 && shoutrrrUrls[0] === '' && url !== '') {
            setShoutrrrUrls([url]);
        } else setShoutrrrUrls((prev) => [...prev, url]);
    };

    const [submitting, setSubmitting] = useState(false);
    const update = () => {
        setSubmitting(true);

        const data: NotificationType[] = [
            ...emails
                .filter((item) => item != '')
                .map((item) => ({
                    module: 'email',
                    title: item,
                })),
            ...shoutrrrUrls
                .filter((item) => item != '')
                .map((item) => ({
                    module: 'shoutrrr',
                    title: item,
                })),
        ];

        ApiNotification.update(data)
            .then(() => {
                toast.success('Update Success', {
                    description: 'Notification settings have been updated successfully.',
                });
            })
            .catch(ToastError)
            .finally(() => {
                setSubmitting(false);
            });
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Settings
                </CardTitle>
                <CardDescription>
                    Configure notification and alert recipients.
                    <br />
                    Right-click a card in the Monitor Dashboard to add an alert.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 w-full">
                <div className={'border-t'} />
                <div className={'grid gap-1'}>
                    <h2 className={'font-semibold'}>Email Notification</h2>
                    <p className={'text-sm text-muted-foreground'}>
                        Configure email notifications to receive alerts directly in your inbox.
                        <br />
                        Before configuring alerts, make sure this instance has a global email
                        configuration; otherwise, alerts cannot be sent.
                    </p>
                    <div className={'grid gap-3 mt-2 text-xs'}>
                        <Label>Email Addresses</Label>
                        <div
                            className={'border rounded-lg px-3 py-3 flex flex-row flex-wrap gap-3'}
                        >
                            {emails.map((email) => (
                                <Badge key={email} variant="default" className="gap-1 pr-1">
                                    {email}
                                    <button
                                        type="button"
                                        onClick={() => removeEmail(email)}
                                        className="rounded-full cursor-pointer p-0.5 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <input
                                type="email"
                                className={
                                    'outline-none placeholder:text-muted-foreground flex-1 text-sm'
                                }
                                placeholder={'Enter email address and press enter'}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                </div>
                <div className={'border-t'} />
                {/*A tribute to Beszel, I really love this design LOL*/}
                <div className={'grid gap-1'}>
                    <h2 className={'font-semibold'}>Webhook / Push notifications</h2>
                    <p className={'text-sm text-muted-foreground'}>
                        Uses{' '}
                        <a
                            href={'https://containrrr.dev/shoutrrr/v0.8/services/overview/'}
                            target={'_blank'}
                            className={'font-bold hover:underline text-accent-foreground/80'}
                        >
                            Shoutrrr
                        </a>{' '}
                        to integrate with popular notification services.
                    </p>
                    <div className={'grid gap-3 mt-2'}>
                        {shoutrrrUrls.map((item, index) => {
                            return (
                                <ShoutrrrUrlItem
                                    key={index}
                                    url={item}
                                    onChange={(v) => {
                                        setShoutrrrUrls((prev) => {
                                            const next = [...prev];
                                            next[index] = v;
                                            return next;
                                        });
                                    }}
                                    onDelete={() =>
                                        setShoutrrrUrls((prev) => {
                                            const next = [...prev];
                                            next.splice(index, 1);
                                            return next;
                                        })
                                    }
                                />
                            );
                        })}
                        <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size={'sm'} variant={'outline'} onClick={() => {}}>
                                        <Plus /> Add URL
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-52" align="start">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                addShoutrrrUrl(
                                                    'telegram://[TOKEN]@telegram?chats=[@channel-1]'
                                                )
                                            }
                                        >
                                            Telegram
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                addShoutrrrUrl(
                                                    'matrix://[username]:[password]@[host]:[port]/[?rooms=!roomID1[,roomAlias2]]'
                                                )
                                            }
                                        >
                                            Matrix
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => addShoutrrrUrl('discord://[token]@[id]')}
                                        >
                                            Discord
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                addShoutrrrUrl(
                                                    'smtp://[username]:[password]@[host]:[port]/?from=[fromAddress]&to=[recipient1][,recipient2,...]'
                                                )
                                            }
                                        >
                                            Email
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                addShoutrrrUrl(
                                                    'slack://[botname@][token-a]/[token-b]/[token-c]'
                                                )
                                            }
                                        >
                                            Slack
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                addShoutrrrUrl(
                                                    'teams://[group]@[tenant]/[altId]/[groupOwner]?host=[organization].webhook.office.com'
                                                )
                                            }
                                        >
                                            Teams
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => addShoutrrrUrl('')}>
                                            Custom URL
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                <div className={'border-t'} />
                <div>
                    <LoadingButton isLoading={submitting} onClick={update}>
                        Save Changes
                    </LoadingButton>
                </div>
            </CardContent>
        </Card>
    );
};

export default NotificationSettings;
