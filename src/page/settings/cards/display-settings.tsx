import { TvMinimal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx';
import { useUser } from '@/context/useUser.tsx';
import EnableCard from '@/components/enable-card.tsx';

const DisplaySettings = () => {
    const { t } = useTranslation();
    const { config, updateConfig } = useUser();

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <TvMinimal className="h-5 w-5 text-primary" />
                    {t('pages.display.title')}
                </CardTitle>
                <CardDescription>{t('pages.display.description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 w-full">
                <div className="grid gap-3">
                    <Label>{t('pages.display.graphLayout')}</Label>
                    <Select
                        value={config.defaultLayout}
                        onValueChange={(e) => {
                            updateConfig({ defaultLayout: e as 'grid-3' | 'grid-2' | 'list' });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="grid-3">3-Column Grid Layout</SelectItem>
                                <SelectItem value="grid-2">2-Column Grid Layout</SelectItem>
                                <SelectItem value="list">{t('pages.display.list')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-3">
                    <Label>{t('pages.display.timeframe')}</Label>
                    <Select
                        value={config.defaultTimeFrame}
                        onValueChange={(e) => {
                            updateConfig({ defaultTimeFrame: e });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>{t('pages.display.timeframeLabel')}</SelectLabel>
                                <SelectItem value="1h">1H</SelectItem>
                                <SelectItem value="12h">12H</SelectItem>
                                <SelectItem value="24h">24H</SelectItem>
                                <SelectItem value="7d">7D</SelectItem>
                                <SelectItem value="30d">30D</SelectItem>
                                <SelectItem value="365d">365D</SelectItem>
                                <SelectLabel>{t('pages.display.special')}</SelectLabel>
                                <SelectItem value="real-time">
                                    {t('pages.display.realtime')}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-3">
                    <Label>{t('pages.display.aggregation')}</Label>
                    <Select
                        value={config.defaultMonitorMode}
                        onValueChange={(e) => {
                            updateConfig({ defaultMonitorMode: e as 'avg' | 'max' | 'raw' });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="avg">{t('pages.display.average')}</SelectItem>
                                <SelectItem value="max">{t('pages.display.maximum')}</SelectItem>
                                <SelectItem value="raw">{t('pages.display.raw')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-3">
                    <Label>{t('pages.display.minMax')}</Label>
                    <Select
                        value={config.defaultMinMaxMode}
                        onValueChange={(e) => {
                            updateConfig({
                                defaultMinMaxMode: e as 'min-auto' | '0-auto' | '0-max',
                            });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="min-auto">
                                    {t('pages.display.minAuto')}
                                </SelectItem>
                                <SelectItem value="0-auto">0 - Auto</SelectItem>
                                <SelectItem value="0-max">0 - Max</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <EnableCard
                    value={config.autoRefresh}
                    onChange={(v) => {
                        updateConfig({ autoRefresh: v });
                    }}
                    title={t('pages.display.autoRefresh')}
                    description={
                        'Automatically refresh graphs at regular intervals to display the most recent data.'
                    }
                />
                <div className={'border-t my-1'} />
                <div className="grid gap-3">
                    <Label>{t('pages.display.dashboardLayout')}</Label>
                    <Select
                        value={config.dashboardLayout}
                        onValueChange={(e) => {
                            updateConfig({ dashboardLayout: e as 'grid' | 'list' | 'list2' });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="grid">{t('pages.display.grid')}</SelectItem>
                                <SelectItem value="list">{t('pages.display.list1')}</SelectItem>
                                <SelectItem value="list2">{t('pages.display.list2')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <EnableCard
                    value={config.dashboardShowDetails}
                    onChange={(v) => {
                        updateConfig({ dashboardShowDetails: v });
                    }}
                    title={t('pages.display.alwaysShowDetails')}
                    description={t('pages.display.alwaysShowDetailsDesc')}
                />
                <div className={'border-t my-1'} />
                <div className="grid gap-3">
                    <Label>{t('pages.display.renderer')}</Label>
                    <Select
                        value={config.terminalRenderer}
                        onValueChange={(e) => {
                            updateConfig({ terminalRenderer: e as 'xterm' | 'ghostty-web' });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="xterm">xterm.js</SelectItem>
                                <SelectItem value="ghostty-web">Ghostty Web</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
};

export default DisplaySettings;
