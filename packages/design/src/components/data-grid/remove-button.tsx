import classNames from "classnames";
import {MouseEventHandler} from "react";
import {PropsWithClass, PropsWithOnClick} from "@brewdocs.beer/core";
import {Minus} from "@/components/svg";
import {ROW_ICON_BUTTON} from "./styles";

export function DataGridRemoveButton({ className, onClick, label, title, disabled }: PropsWithClass & PropsWithOnClick & { label: string, title?: string, disabled?: boolean }) {
    return (
        <button
            aria-label={label}
            title={title}
            disabled={disabled}
            onClick={onClick as MouseEventHandler<HTMLButtonElement>}
            className={classNames(ROW_ICON_BUTTON, [className])}
        >
            <Minus className="w-4" />
        </button>
    );
}
