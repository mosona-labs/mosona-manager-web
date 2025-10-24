import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';

const PasswordCheck = ({ password }: { password: string }) => {
    const [show, setShow] = useState<boolean>(false);
    useEffect(() => {
        setShow(password.length > 0);
    }, [password]);

    const items = [
        { ok: password.length >= 8, text: 'At least 8 characters' },
        { ok: /[A-Z]/.test(password), text: 'At least one uppercase letter' },
        { ok: /[a-z]/.test(password), text: 'At least one lowercase letter' },
        { ok: /[0-9]/.test(password), text: 'At least one number' },
        { ok: /[^A-Za-z0-9]/.test(password), text: 'At least one special character' },
    ];

    return (
        <div
            className="overflow-hidden transition-[max-height,opacity] duration-300"
            style={{ maxHeight: show ? 400 : 0, opacity: show ? 1 : 0 }}
        >
            <Card className="px-3 py-2 rounded-lg bg-accent mt-3">
                <ul className="text-sm">
                    {items.map((it, idx) => (
                        <li
                            key={idx}
                            className={`flex items-center gap-2 transition-colors duration-200 ${
                                it.ok ? 'text-green-500' : 'text-muted-foreground'
                            }`}
                        >
                            <span
                                className={`inline-flex items-center justify-center text-xs rounded-full transition-transform duration-200 ${
                                    it.ok ? 'scale-100 opacity-100' : 'scale-75 opacity-60'
                                }`}
                            >
                                {it.ok ? '✓' : '✗'}
                            </span>
                            <span className="whitespace-nowrap">{it.text}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default PasswordCheck;
