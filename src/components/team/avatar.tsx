import { Edit2, X } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { hexToRgb, rgbToLuminance, hexToHsl, hslToHex, contrastRatio } from '@/utils/color';
import { Button } from '@/components/ui/button';

const AvatarEditor = ({
    colorRef,
    imageFileRef,
    name,
    defaultColor,
    defaultImageFile,
}: {
    defaultColor?: string;
    defaultImageFile?: string | null;
    colorRef: RefObject<string>;
    imageFileRef: RefObject<File | string | null>;
    name: string;
}) => {
    const [tab, setTab] = useState<'color' | 'photo'>('color');

    const [color, setColor] = useState(colorRef.current);
    const [textColor, setTextColor] = useState('#000000');
    const [imageFile, setImageFile] = useState<File | string | null>(imageFileRef.current);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null);
            return;
        }
        const url = typeof imageFile === 'string' ? imageFile : URL.createObjectURL(imageFile);
        setPreviewUrl(url);
        setColor('#ffffff');
        colorRef.current = '#ffffff';
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [imageFile, imageFileRef]);

    useEffect(() => {
        if (!defaultImageFile) {
            setPreviewUrl(null);
        } else {
            setImageFile('/avatars/' + defaultImageFile);
            setPreviewUrl('/avatars/' + defaultImageFile);
            setTab('photo');
        }
        if (defaultColor) {
            setColor(defaultColor);
            colorRef.current = defaultColor;
        }
    }, [defaultImageFile, defaultColor]);

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className="w-35.5 h-35.5 relative rounded-lg"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="avatar"
                            className="h-full w-full object-cover rounded-lg"
                        />
                    ) : (
                        <div
                            className="h-full w-full flex items-center justify-center text-8xl font-bold text-muted-foreground"
                            style={{
                                color: textColor,
                            }}
                        >
                            {name ? name.charAt(0).toUpperCase() : 'A'}
                        </div>
                    )}
                    <div className="absolute w-full h-full top-0 start-0 bg-black/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Edit2 />
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-58">
                <div className="grid gap-3">
                    <div className="space-y-1">
                        <h4 className="leading-none font-medium">Avatar</h4>
                        <p className="text-muted-foreground text-sm">
                            Choose a color or upload a photo for your team avatar.
                        </p>
                    </div>
                    <Tabs
                        defaultValue="color"
                        value={tab}
                        onValueChange={(e) => {
                            if (e === 'color') {
                                setImageFile(null);
                                imageFileRef.current = null;
                            }
                            setTab(e as 'color' | 'photo');
                        }}
                    >
                        <TabsList className="w-full">
                            <TabsTrigger value="color">Color</TabsTrigger>
                            <TabsTrigger value="photo">Photo</TabsTrigger>
                        </TabsList>
                        <TabsContent value="color" className="space-y-3">
                            <HexColorPicker
                                color={color}
                                onChange={(e) => {
                                    setColor(e);
                                    colorRef.current = e;
                                }}
                            />
                            <Input
                                value={color}
                                onChange={(e) => {
                                    setColor(e.target.value);
                                    colorRef.current = e.target.value;
                                }}
                            />
                        </TabsContent>
                        <TabsContent value="photo" className="space-y-2">
                            <Button
                                variant={'outline'}
                                className="w-full"
                                onClick={() => {
                                    setImageFile(null);
                                    imageFileRef.current = null;
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                            >
                                <X />
                                Remove Photo
                            </Button>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setImageFile(file);
                                    imageFileRef.current = file;
                                }}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AvatarEditor;
