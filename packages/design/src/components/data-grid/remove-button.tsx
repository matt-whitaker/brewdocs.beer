import classNames from "classnames";
import {MouseEventHandler} from "react";
import {PropsWithClass, PropsWithOnClick} from "@brewdocs.beer/core";
import {Minus} from "@/components/svg";

export function DataGridRemoveButton({ className, onClick, label, title, disabled }: PropsWithClass & PropsWithOnClick & { label: string, title?: string, disabled?: boolean }) {
    return (
        <button
            aria-label={label}
            title={title}
            disabled={disabled}
            onClick={onClick as MouseEventHandler<HTMLButtonElement>}
            className={classNames("btn btn-xs p-0 m-0 btn-ghost absolute left-1.5 top-2", [className])}
        >
            <Minus className="w-4" />
        </button>
    );
}
