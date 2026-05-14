const DEFAULT_SITE_TITLE = 'Mosona Manager';
const DEFAULT_FAVICON_PATH = '/favicon.svg';

const getCurrentBranding = () => {
    if (typeof document === 'undefined') {
        return {
            title: DEFAULT_SITE_TITLE,
            faviconHref: undefined,
        };
    }

    const pageTitle = document.title.trim();
    const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    const faviconHref = favicon?.href;
    const faviconPath = faviconHref ? new URL(faviconHref, window.location.origin).pathname : '';

    return {
        title: pageTitle && pageTitle !== DEFAULT_SITE_TITLE ? pageTitle : DEFAULT_SITE_TITLE,
        faviconHref: faviconPath && faviconPath !== DEFAULT_FAVICON_PATH ? faviconHref : undefined,
    };
};

const useSiteBranding = () => getCurrentBranding();

export { DEFAULT_SITE_TITLE, DEFAULT_FAVICON_PATH, useSiteBranding };
