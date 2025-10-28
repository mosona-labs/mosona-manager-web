import { memo, useEffect, useState } from 'react';

import { hexToRgb, rgbToLuminance, hexToHsl, hslToHex, contrastRatio } from '@/utils/color';
import { cn } from '@/lib/utils';

const TeamAvatar = ({
    className,
    color,
    imageUrl,
    name,
}: {
    className?: string;
    color: string;
    imageUrl: string;
    name: string;
}) => {
    const [textColor, setTextColor] = useState('#000000');

    useEffect(() => {
        const bgRgb = hexToRgb(color);
        if (!bgRgb) {
            setTextColor('#000000');
            return;
        }
        const bgLum = rgbToLuminance(bgRgb);
        const target = 4.5;
        const { h, s, l } = hexToHsl(color);
        const step = 0.05;
        const maxSteps = 20;

        const preferredDir = l > 0.5 ? -1 : 1;
        let found: string | null = null;

        const tryDirection = (dir: number) => {
            for (let i = 0; i <= maxSteps; i++) {
                const newL = Math.max(0, Math.min(1, l + dir * i * step));
                const candidateHex = hslToHex(h, s, newL);
                const candRgb = hexToRgb(candidateHex)!;
                const candLum = rgbToLuminance(candRgb);
                if (contrastRatio(bgLum, candLum) >= target) {
                    return candidateHex;
                }
            }
            return null;
        };

        found = tryDirection(preferredDir);
        if (!found) found = tryDirection(-preferredDir);

        if (!found) {
            setTextColor(bgLum > 0.5 ? '#000000' : '#FFFFFF');
        } else {
            setTextColor(found);
        }
    }, [color]);

    return (
        <div
            className={cn('w-8 h-8 relative rounded-md', className)}
            style={{
                backgroundColor: color,
            }}
        >
            {imageUrl ? (
                <img
                    src={'/avatars/' + imageUrl}
                    alt="avatar"
                    className="h-full w-full object-cover rounded-lg"
                />
            ) : (
                <div
                    className="h-full w-full flex items-center justify-center text-lg font-bold text-muted-foreground"
                    style={{
                        color: textColor,
                    }}
                >
                    {name ? name.charAt(0).toUpperCase() : 'A'}
                </div>
            )}
        </div>
    );
};

export default memo(TeamAvatar);
