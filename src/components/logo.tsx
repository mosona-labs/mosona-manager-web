import { cn } from '@/lib/utils';
import { useSiteBranding } from '@/hooks/useSiteBranding';

const Logo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const { faviconHref } = useSiteBranding();

    return (
        <div
            className={cn(
                'w-9 h-9 overflow-hidden rounded-lg',
                faviconHref ? 'bg-background ring-1 ring-border' : 'bg-green-200',
                className
            )}
            {...props}
        >
            {faviconHref && (
                <img src={faviconHref} alt="logo" className="h-full w-full object-cover" />
            )}
        </div>
    );
};

export default Logo;
