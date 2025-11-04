const Browser = ({ browser }: { browser: string }) => {
    switch (browser) {
        case 'Chrome':
            return <img className={'w-4'} src="/icons/chrome.svg" />;
        case 'Firefox':
            return <img className={'w-4'} src="/icons/firefox.svg" />;
        case 'Safari':
            return <img className={'w-4'} src="/icons/safari.svg" />;
        case 'Edge':
            return <img className={'w-4'} src="/icons/edge.svg" />;
        case 'Opera':
            return <img className={'w-4'} src="/icons/opera.svg" />;
        default:
            return <span>🌍</span>;
    }
};
export default Browser;
