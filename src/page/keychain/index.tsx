import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import ApiKey, { type KeyType } from '@/api/key.ts';
import AddKey from '@/page/keychain/components/add.tsx';
import { ToastError } from '@/utils/toast.ts';
import KeyCard from '@/page/keychain/components/card.tsx';

const Keychain = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [data, setData] = useState<KeyType[]>([]);

    const refresh = () => {
        setIsLoading(true);
        ApiKey.list()
            .then((res) => {
                setData(res.data);
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
                    <h1 className="text-2xl font-bold">Keychain</h1>
                    <p className="opacity-65">
                        Manage SSH keys and access credentials for your servers.
                    </p>
                </div>
                <div className="flex flex-row gap-2">
                    <AddKey refresh={refresh} />
                </div>
            </div>
            <div className="w-full">
                {isLoading ? (
                    <LoaderCircle className="animate-spin text-muted-foreground" size={48} />
                ) : data.length === 0 ? (
                    <p className={'text-center mt-4'}>No keys found.</p>
                ) : (
                    <div className={'category-terminal-grid'}>
                        {data.map((key) => (
                            <KeyCard key={key.id} item={key} refresh={refresh} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Keychain;
