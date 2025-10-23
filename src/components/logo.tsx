import { cn } from '@/lib/utils';

const Logo = (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('w-9 h-9 bg-green-200 rounded-lg', props.className)}></div>
);

export default Logo;
