import { cn } from '@/lib/utils.ts';

const IsRequired = ({ className }: { className?: string }) => (
    <span className={cn('text-red-500 -ms-1', className)}>*</span>
);

export default IsRequired;
