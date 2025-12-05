import { useEffect, useState } from 'react';

import ApiAdminOAuth, { type OAuthProviderType } from '@/api/admin/oauth.ts';
import { Card } from '@/components/ui/card.tsx';
import Add from '@/admin/page/settings/oauth/components/add.tsx';
import { ToastError } from '@/utils/toast.ts';
import BottomPagination from '@/components/bottom-pagination.tsx';
import OAuthItems from '@/admin/page/settings/oauth/components/items.tsx';

const OAuth = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    const [oauth, setOAuth] = useState<OAuthProviderType[]>([]);
    const [count, setCount] = useState(0);

    const refresh = () => {
        setIsLoading(true);
        ApiAdminOAuth.list(page, perPage)
            .then((res) => {
                setOAuth(res.data.items);
                setCount(res.data.total);
            })
            .catch(ToastError)
            .finally(() => {
                setIsLoading(false);
            });
    };
    useEffect(refresh, []);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">OAuth2</h1>
                    <p className="opacity-65">
                        Manage OAuth settings for third-party authentication providers.
                    </p>
                </div>
                <Add refresh={refresh} />
            </div>
            <div className={'flex flex-col gap-3'}>
                <Card className="p-2 border-none">
                    <OAuthItems items={oauth} isLoading={isLoading} refresh={refresh} />
                </Card>
                <BottomPagination
                    count={count}
                    page={page}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    setPage={setPage}
                />
            </div>
        </div>
    );
};

export default OAuth;
