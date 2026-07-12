import type { KeyType } from '@/api/key.ts';

import { Pencil, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ContextMenu } from '@/components/context-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import EditKey from '@/page/keychain/components/edit.tsx';
import DelKey from '@/page/keychain/components/del.tsx';

const KeyCard = ({ item, mounted, index }: { item: KeyType; mounted: boolean; index: number }) => {
    const { t } = useTranslation();
    const [editOpen, setEditOpen] = useState(false);
    const [delOpen, setDelOpen] = useState(false);

    return (
        <div
            style={{
                transition: 'opacity 400ms ease, transform 400ms ease',
                transitionDelay: `${140 + index * 60}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(10px)',
            }}
        >
            <ContextMenu
                items={[
                    {
                        label: t('common.edit'),
                        icon: <Settings className="h-4 w-4" />,
                        onClick: () => {
                            setEditOpen(true);
                        },
                    },
                    {
                        separator: true,
                        label: '',
                    },
                    {
                        label: t('common.delete'),
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => {
                            setDelOpen(true);
                        },
                        danger: true,
                    },
                ]}
            >
                <div className="px-4 py-3 border border-border rounded-lg bg-secondary/30 flex flex-row items-center gap-1 hover:border-primary/50 transition-all cursor-pointer">
                    <div>
                        <h2 className="font-medium font-mono">{item.name}</h2>
                        <p className="text-xs text-muted-foreground">
                            {t('pages.keychain.addedOn', {
                                date: new Date(item.created_at).toLocaleDateString(),
                            })}
                        </p>
                    </div>
                    <div className={'flex-1'} />
                    <Button
                        variant="ghost"
                        className="bg-accent"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditOpen(true);
                        }}
                    >
                        <Pencil />
                    </Button>
                </div>
            </ContextMenu>
            {/*Edit*/}
            <EditKey open={editOpen} onOpenChange={setEditOpen} item={item} />
            {/*Delete*/}
            <DelKey open={delOpen} onOpenChange={setDelOpen} item={item} />
        </div>
    );
};

export default KeyCard;
