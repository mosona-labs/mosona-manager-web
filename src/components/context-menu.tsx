import * as React from 'react';
import { useEffect, useLayoutEffect } from 'react';

import { cn } from '@/lib/utils';

export interface ContextMenuItem {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    separator?: boolean;
    danger?: boolean;
}

const VIEWPORT_MARGIN = 10;

type OpenMenu = (anchor: HTMLElement) => void;

const MenuTriggerContext = React.createContext<OpenMenu | null>(null);

export function useContextMenuTrigger(): OpenMenu | null {
    return React.useContext(MenuTriggerContext);
}

const MenuBtn = ({
    item,
    handleItemClick,
}: {
    item: ContextMenuItem;
    handleItemClick?: (item: ContextMenuItem) => void;
}) => (
    <button
        onClick={() => handleItemClick?.(item)}
        disabled={item.disabled}
        className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            'hover:bg-accent hover:text-accent-foreground cursor-pointer',
            'disabled:pointer-events-none disabled:opacity-50',
            item.danger && 'text-destructive hover:bg-destructive/10'
        )}
    >
        {item.icon && <span className="shrink-0">{item.icon}</span>}
        {item.label && <span className="flex-1 text-start">{item.label}</span>}
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
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const anchorRef = React.useRef<DOMRect | null>(null);

    const openAt = React.useCallback((x: number, y: number, anchor: DOMRect | null) => {
        anchorRef.current = anchor;
        setPosition({ x, y });
        setIsOpen(true);
    }, []);

    const openFromElement = React.useCallback<OpenMenu>(
        (el) => {
            const rect = el.getBoundingClientRect();
            openAt(rect.left, rect.bottom + 4, rect);
        },
        [openAt]
    );

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        openAt(e.clientX, e.clientY, null);
    };

    const handleItemClick = (item: ContextMenuItem) => {
        if (!item.disabled && item.onClick) {
            item.onClick();
        }
        setIsOpen(false);
    };

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (menuRef.current?.contains(target) || wrapperRef.current?.contains(target)) {
                return;
            }
            setIsOpen(false);
        };
        const handleScroll = () => setIsOpen(false);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('scroll', handleScroll, true);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!isOpen || !menuRef.current) return;

        const rect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let { x, y } = position;
        const anchor = anchorRef.current;

        if (anchor) {
            x = Math.min(anchor.right - rect.width, viewportWidth - rect.width - VIEWPORT_MARGIN);
            x = Math.max(x, VIEWPORT_MARGIN);
        } else if (x + rect.width > viewportWidth) {
            x = viewportWidth - rect.width - VIEWPORT_MARGIN;
        }

        if (y + rect.height > viewportHeight) {
            y = viewportHeight - rect.height - VIEWPORT_MARGIN;
        }

        if (x !== position.x || y !== position.y) {
            setPosition({ x, y });
        }
    }, [isOpen, position]);

    useEffect(() => {
        if (isOpen && menuRef.current) {
            menuRef.current.focus();
        }
    }, [isOpen]);

    return (
        <MenuTriggerContext.Provider value={openFromElement}>
            <div
                ref={wrapperRef}
                onContextMenu={handleContextMenu}
                onClick={() => setIsOpen(false)}
                className={className}
            >
                {children}
            </div>

            {isOpen && (
                <div
                    ref={menuRef}
                    tabIndex={-1}
                    className="fixed z-50 min-w-[200px] rounded-lg border border-border bg-popover p-1 shadow-lg outline-none"
                    style={{ left: `${position.x}px`, top: `${position.y}px` }}
                >
                    {items.map((item, index) =>
                        item.separator ? (
                            <div key={`separator-${index}`} className="my-1 h-px bg-border" />
                        ) : (
                            <MenuBtn key={index} item={item} handleItemClick={handleItemClick} />
                        )
                    )}
                </div>
            )}
        </MenuTriggerContext.Provider>
    );
}
