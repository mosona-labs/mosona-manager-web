import * as React from 'react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    separator?: boolean;
    danger?: boolean;
}

const MenuBtn = ({
    item,
    handleItemClick,
}: {
    item: ContextMenuItem;
    handleItemClick?: (item: ContextMenuItem) => void;
}) => (
    <button
        onClick={() => handleItemClick && handleItemClick(item)}
        disabled={item.disabled}
        className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            'hover:bg-accent hover:text-accent-foreground cursor-pointer',
            'disabled:pointer-events-none disabled:opacity-50',
            item.danger && 'text-destructive hover:bg-destructive/10'
        )}
    >
        {item.icon && <span className="shrink-0">{item.icon}</span>}
        <span className="flex-1 text-left">{item.label}</span>
    </button>
);

export function ContextMenu({
    items,
    children,
    className,
}: {
    items: ContextMenuItem[];
    children: React.ReactNode;
    className?: string;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const menuRef = React.useRef<HTMLDivElement>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();

        const x = e.clientX;
        const y = e.clientY;

        setPosition({ x, y });
        setIsOpen(true);
    };

    const handleClick = () => {
        setIsOpen(false);
    };

    const handleItemClick = (item: ContextMenuItem) => {
        if (!item.disabled && item.onClick) {
            item.onClick();
        }
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && menuRef.current) {
            const menu = menuRef.current;
            const rect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let newX = position.x;
            let newY = position.y;

            if (rect.right > viewportWidth) {
                newX = viewportWidth - rect.width - 10;
            }

            if (rect.bottom > viewportHeight) {
                newY = viewportHeight - rect.height - 10;
            }

            if (newX !== position.x || newY !== position.y) {
                setPosition({ x: newX, y: newY });
            }
        }
    }, [isOpen, position]);

    return (
        <>
            <div onContextMenu={handleContextMenu} onClick={handleClick} className={className}>
                {children}
            </div>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="fixed z-50 min-w-[200px] rounded-lg border border-border bg-popover p-1 shadow-lg"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}
                >
                    {items.map((item, index) => {
                        if (item.separator) {
                            return (
                                <div key={`separator-${index}`} className="my-1 h-px bg-border" />
                            );
                        }

                        return (
                            <MenuBtn key={index} item={item} handleItemClick={handleItemClick} />
                        );
                    })}
                </div>
            )}
        </>
    );
}
