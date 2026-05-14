import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { toast } from 'sonner';

import { useSettings } from '@/admin/page/settings/useSettings.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import LoadingButton from '@/components/loading-button.tsx';
import ApiAdminSettings from '@/api/admin/settings.ts';
import { ToastError } from '@/utils/toast.ts';
import EnableCard from '@/components/enable-card.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Slider } from '@/components/ui/slider.tsx';

const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', reject);
        image.src = url;
    });

const getCroppedImageFile = async (imageUrl: string, crop: Area) => {
    const image = await createImage(imageUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Canvas is not supported.');
    }

    canvas.width = crop.width;
    canvas.height = crop.height;
    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });
    if (!blob) {
        throw new Error('Failed to crop image.');
    }

    return new File([blob], 'favicon.png', { type: 'image/png' });
};

const General = () => {
    const { settings, refresh } = useSettings();

    const [title, setTitle] = useState('');
    const [domain, setDomain] = useState('');
    const [debugMode, setDebugMode] = useState(false);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [faviconPreview, setFaviconPreview] = useState('');
    const faviconObjectUrlRef = useRef<string | null>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const cropImageObjectUrlRef = useRef<string | null>(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [cropImageUrl, setCropImageUrl] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const revokeFaviconObjectUrl = () => {
        if (faviconObjectUrlRef.current) {
            URL.revokeObjectURL(faviconObjectUrlRef.current);
            faviconObjectUrlRef.current = null;
        }
    };
    const revokeCropImageObjectUrl = () => {
        if (cropImageObjectUrlRef.current) {
            URL.revokeObjectURL(cropImageObjectUrlRef.current);
            cropImageObjectUrlRef.current = null;
        }
    };

    const onSaveChanges = async () => {
        setIsSubmitting(true);
        try {
            const updates = [];
            if (settings?.domain !== domain) {
                updates.push({
                    key: 'domain',
                    value: domain.endsWith('/') ? domain.slice(0, -1) : domain,
                });
            }
            if (settings?.debug !== debugMode) {
                updates.push({
                    key: 'debug',
                    value: debugMode ? 'true' : 'false',
                });
            }
            if ((settings?.title || '') !== title.trim()) {
                updates.push({
                    key: 'title',
                    value: title.trim(),
                });
            }

            if (updates.length > 0) {
                await ApiAdminSettings.set(updates);
            }
            if (faviconFile) {
                await ApiAdminSettings.uploadFavicon(faviconFile);
            }
            if (updates.length === 0 && !faviconFile) {
                return;
            }

            await refresh();
            setFaviconFile(null);
            toast.success('Success', {
                description: 'Settings updated successfully.',
            });
        } catch (err) {
            ToastError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFaviconChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        revokeCropImageObjectUrl();
        const nextCropImageUrl = URL.createObjectURL(file);
        cropImageObjectUrlRef.current = nextCropImageUrl;
        setCropImageUrl(nextCropImageUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setCropOpen(true);
    };

    const resetFaviconInput = () => {
        if (faviconInputRef.current) {
            faviconInputRef.current.value = '';
        }
    };

    const closeCropDialog = () => {
        setCropOpen(false);
        setCropImageUrl('');
        setCroppedAreaPixels(null);
        setIsCropping(false);
        revokeCropImageObjectUrl();
        resetFaviconInput();
    };

    const applyFaviconCrop = async () => {
        if (!cropImageUrl || !croppedAreaPixels) return;

        setIsCropping(true);
        try {
            const file = await getCroppedImageFile(cropImageUrl, croppedAreaPixels);
            const previewUrl = URL.createObjectURL(file);
            revokeFaviconObjectUrl();
            faviconObjectUrlRef.current = previewUrl;
            setFaviconFile(file);
            setFaviconPreview(previewUrl);
            closeCropDialog();
        } catch (err) {
            ToastError(err);
            setIsCropping(false);
        }
    };

    useEffect(() => {
        return () => {
            revokeFaviconObjectUrl();
            revokeCropImageObjectUrl();
        };
    }, []);

    useEffect(() => {
        if (!faviconFile) {
            revokeFaviconObjectUrl();
            setFaviconPreview(settings?.favicon || '');
        }
    }, [faviconFile, settings?.favicon]);

    // Init
    useEffect(() => {
        if (settings) {
            setTitle(settings.title || '');
            setDomain(settings.domain);
            setDebugMode(settings.debug);
            setFaviconFile(null);
            setFaviconPreview(settings.favicon || '');
        }
    }, [settings]);

    return (
        <div className="w-full p-5 h-full overflow-y-auto pb-24">
            <div className="flex flex-row justify-between items-center mb-3">
                <div>
                    <h1 className="text-2xl font-bold">General</h1>
                    <p className="opacity-65">Manage general settings for your application.</p>
                </div>
            </div>
            <div className={'flex flex-col gap-3'}>
                <div className={'space-y-2'}>
                    <Label className={'text-xs'}>Site Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                        placeholder={'Mosona Manager'}
                        maxLength={255}
                        className={'max-w-[26rem] w-full'}
                    />
                    <p className={'text-xs text-muted-foreground'}>
                        The browser title for your application. Leave it empty to use the built
                        frontend title.
                    </p>
                </div>
                <div className={'space-y-2'}>
                    <Label className={'text-xs'}>Favicon</Label>
                    <div className="flex max-w-[26rem] flex-row items-center gap-3">
                        {faviconPreview ? (
                            <img
                                src={faviconPreview}
                                alt="Site favicon"
                                className="h-10 w-10 shrink-0 rounded border object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 shrink-0 rounded border bg-muted" />
                        )}
                        <Input
                            ref={faviconInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp,image/*"
                            onChange={onFaviconChange}
                        />
                    </div>
                    <p className={'text-xs text-muted-foreground'}>
                        Upload a PNG, JPEG, WebP, or GIF image up to 5 MiB. The stored favicon is
                        converted by the server.
                    </p>
                </div>
                <div className={'space-y-2'}>
                    <Label className={'text-xs'}>Base URL</Label>
                    <Input
                        value={domain}
                        onChange={(e) => {
                            setDomain(e.target.value);
                        }}
                        placeholder={'https://example.com'}
                        className={'max-w-[26rem] w-full'}
                    />
                    <p className={'text-xs text-muted-foreground'}>
                        The base URL of your application. This is used for generating links, oauth
                        and emails.
                    </p>
                </div>
                <div className={'space-y-2'}>
                    <Label className={'text-xs'}>Debug Mode</Label>
                    <EnableCard
                        value={debugMode}
                        onChange={setDebugMode}
                        title={'Enable Debug Mode'}
                        description={
                            'When enabled, detailed error messages and stack traces will be shown.'
                        }
                        className={'max-w-[26rem]'}
                    />
                </div>
                <div>
                    <LoadingButton
                        onClick={onSaveChanges}
                        isLoading={isSubmitting}
                        variant={'outline'}
                    >
                        Save Changes
                    </LoadingButton>
                </div>
            </div>
            <Dialog open={cropOpen} onOpenChange={(nextOpen) => !nextOpen && closeCropDialog()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crop Favicon</DialogTitle>
                        <DialogDescription>
                            Select a square area for the site favicon.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative h-72 overflow-hidden rounded-md bg-muted">
                        {cropImageUrl && (
                            <Cropper
                                image={cropImageUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                            />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs">Zoom</Label>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeCropDialog}
                            disabled={isCropping}
                        >
                            Cancel
                        </Button>
                        <LoadingButton isLoading={isCropping} onClick={applyFaviconCrop}>
                            Apply Crop
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default General;
