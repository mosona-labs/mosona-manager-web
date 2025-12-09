import { LoaderCircle } from 'lucide-react';

import AddKey from '@/page/keychain/components/add.tsx';
import KeyCard from '@/page/keychain/components/card.tsx';
import { useUser } from '@/context/useUser.tsx';

const Keychain = () => {
    const { keys } = useUser();

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
                    <AddKey />
                </div>
            </div>
            <div className="w-full">
                {!keys ? (
                    <LoaderCircle className="animate-spin text-muted-foreground" size={48} />
                ) : keys.length === 0 ? (
                    <p className={'text-center mt-4'}>No keys found.</p>
                ) : (
                    <div className={'category-terminal-grid'}>
                        {keys.map((key) => (
                            <KeyCard key={key.id} item={key} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Keychain;
