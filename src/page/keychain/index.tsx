import { useEffect, useState } from 'react';

import AddKey from '@/page/keychain/components/add.tsx';
import KeyCard from '@/page/keychain/components/card.tsx';
import KeychainSkeletonCard from '@/page/keychain/components/skeleton-card.tsx';
import { useUser } from '@/context/useUser.tsx';

const Keychain = () => {
    const { keys } = useUser();
    const [mounted, setMounted] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    useEffect(() => {
        let fadeInTimer: number | undefined;
        let fadeOutTimer: number | undefined;

        if (!keys) {
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
    }, [keys]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24 relative">
            {showSkeleton ? (
                <div
                    className="absolute inset-5 z-40 pointer-events-none overflow-hidden transition-opacity duration-400"
                    style={{ opacity: keys ? 0 : 1 }}
                >
                    <div className="flex flex-row justify-between items-center mb-3">
                        <div>
                            <div className="h-8 w-32 rounded bg-muted-foreground/10 animate-pulse" />
                            <div className="mt-2 h-4 w-72 rounded bg-muted-foreground/8 animate-pulse" />
                        </div>
                        <div className="h-10 w-28 rounded bg-muted-foreground/8 animate-pulse" />
                    </div>
                    <div className="category-terminal-grid">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <KeychainSkeletonCard key={index} />
                        ))}
                    </div>
                </div>
            ) : null}

            <div
                style={{
                    transition: 'opacity 400ms ease',
                    opacity: mounted ? 1 : 0,
                }}
            >
                <div
                    className="flex flex-row justify-between items-center mb-3"
                    style={{
                        transition: 'opacity 400ms ease, transform 400ms ease',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'none' : 'translateY(6px)',
                    }}
                >
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
                    {!keys ? null : keys.length === 0 ? (
                        <p
                            className={'text-center mt-4'}
                            style={{
                                transition: 'opacity 400ms ease, transform 400ms ease',
                                transitionDelay: '100ms',
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'none' : 'translateY(8px)',
                            }}
                        >
                            No keys found.
                        </p>
                    ) : (
                        <div className={'category-terminal-grid'}>
                            {keys.map((key, index) => (
                                <KeyCard
                                    key={key.id}
                                    item={key}
                                    mounted={mounted}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Keychain;
