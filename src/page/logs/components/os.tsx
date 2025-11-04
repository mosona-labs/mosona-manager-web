const OS = ({ os }: { os: string }) => {
    switch (os) {
        case 'Windows':
            return <img className={'w-4'} src="/icons/windows.svg" />;
        case 'macOS':
            return <img className={'w-4'} src="/icons/macos.svg" />;
        case 'Linux':
            return <img className={'w-4'} src="/icons/linux.svg" />;
        case 'Android':
            return <img className={'w-4'} src="/icons/android.svg" />;
        case 'iOS':
            return <img className={'w-4'} src="/icons/ios.svg" />;
        case 'Chrome OS':
            return <img className={'w-4'} src="/icons/chrome.svg" />;
        default:
            return <span>🐧</span>;
    }
};
export default OS;
