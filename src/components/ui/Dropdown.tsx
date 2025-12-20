import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    dropdownClassName?: string;
    align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    children,
    className,
    dropdownClassName,
    align = 'right'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen]);

    useEffect(() => {
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={clsx('relative inline-block', className)} ref={buttonRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className={clsx(
                        "fixed mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[10000] overflow-hidden",
                        dropdownClassName
                    )}
                    style={{
                        top: position.top,
                        left: align === 'right'
                            ? position.left + position.width - 192 // Default width 192 (w-48) or similar
                            : position.left,
                        minWidth: '160px'
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    {children}
                </div>,
                document.body
            )}
        </div>
    );
};
