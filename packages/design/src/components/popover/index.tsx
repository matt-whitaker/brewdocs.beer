import classNames from "classnames";
import {KeyboardEvent, FocusEvent, PropsWithChildren, ReactNode, useCallback, useEffect, useId, useRef, useState} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export type PopoverProps = PropsWithChildren & PropsWithClass & {
    trigger: ReactNode;
    placement?: PopoverPlacement;
    label?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const PLACEMENT_CLASSES: Record<PopoverPlacement, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
};

export function Popover({ trigger, children, placement = "top", label, open, onOpenChange, className }: PopoverProps) {
    const id = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const touchedRef = useRef(false);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const isOpen = open ?? uncontrolledOpen;

    const setOpen = useCallback((next: boolean) => {
        if (open === undefined) {
            setUncontrolledOpen(next);
        }
        onOpenChange?.(next);
    }, [open, onOpenChange]);

    useEffect(() => {
        if (!isOpen) return;

        function onPointerDown(event: MouseEvent | TouchEvent) {
            if (containerRef.current?.contains(event.target as Node)) return;
            setOpen(false);
        }

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
        };
    }, [isOpen, setOpen]);

    const onMouseEnter = useCallback(() => {
        if (touchedRef.current) return;
        setOpen(true);
    }, [setOpen]);

    const onMouseLeave = useCallback(() => {
        if (touchedRef.current) return;
        setOpen(false);
    }, [setOpen]);

    const onTouchStart = useCallback(() => {
        touchedRef.current = true;
        setOpen(!isOpen);
    }, [isOpen, setOpen]);

    const onClick = useCallback(() => {
        if (touchedRef.current) {
            touchedRef.current = false;
            return;
        }
        setOpen(!isOpen);
    }, [isOpen, setOpen]);

    const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Escape" || !isOpen) return;
        event.stopPropagation();
        setOpen(false);
    }, [isOpen, setOpen]);

    const onBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setOpen(false);
    }, [setOpen]);

    return (
        <div
            ref={containerRef}
            className={classNames("relative inline-flex", [className])}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
        >
            <span onClick={onClick} onTouchStart={onTouchStart} aria-describedby={isOpen ? id : undefined}>
                {trigger}
            </span>
            {isOpen && (
                <div
                    id={id}
                    role="tooltip"
                    aria-label={label}
                    className={classNames(
                        "absolute z-50 w-max max-w-xs",
                        "bg-base-100 text-base-content border border-base-300 rounded-box shadow-lg p-3",
                        PLACEMENT_CLASSES[placement]
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
