import type { ReactNode } from 'react';

import { LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';

const LoadingButton = ({
    isLoading = false,
    type,
    variant = 'default',
    children,
    className,
    onClick,
}: {
    isLoading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null;
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
}) => {
    return (
        <Button
            disabled={isLoading}
            variant={variant}
            className={className}
            onClick={onClick}
            type={type}
        >
            {isLoading && <LoaderCircle className={'me-2 h-4 w-4 animate-spin'} />}
            {children}
        </Button>
    );
};

export default LoadingButton;
