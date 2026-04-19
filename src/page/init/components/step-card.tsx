import type { ReactNode } from 'react';

import { useRef, useState, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils.ts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';

const collapsedHeight = 76;
const expandedHeightBuffer = 16;

const StepCard = ({
    show,
    setStep,
    title,
    description,
    children,
}: {
    show: boolean;
    setStep: () => void;
    title: string;
    description: string;
    children: ReactNode;
}) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [measuredHeight, setMeasuredHeight] = useState<number>(collapsedHeight);

    useLayoutEffect(() => {
        const update = () => {
            const el = contentRef.current;
            if (!el) return;
            const h = el.scrollHeight + expandedHeightBuffer;
            setMeasuredHeight(h || collapsedHeight);
        };
        if (show) update();
        let ro: ResizeObserver | undefined;
        if (typeof ResizeObserver !== 'undefined' && contentRef.current) {
            ro = new ResizeObserver(() => {
                if (show) update();
            });
            ro.observe(contentRef.current);
        }

        return () => {
            if (ro) ro.disconnect();
        };
    }, [show, children]);

    return (
        <Card
            className={cn([
                'w-[90vw] md:w-md py-4',
                'overflow-hidden transition-[height] duration-300 ease-in-out',
            ])}
            style={{ height: show ? `calc(${measuredHeight}px + 2rem)` : `${collapsedHeight}px` }}
        >
            <CardContent className="px-4">
                <div ref={contentRef} className="flow-root">
                    <CardHeader className="px-0 cursor-pointer select-none" onClick={setStep}>
                        <div className={'flex items-center justify-between'}>
                            <CardTitle>{title}</CardTitle>
                            <ChevronDown
                                size={16}
                                className={
                                    show
                                        ? 'rotate-180 transition-transform'
                                        : 'transition-transform'
                                }
                            />
                        </div>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
};

export default StepCard;
