import classNames from "classnames";
import {MouseEventHandler} from "react";
import {PropsWithClass, PropsWithOnClick} from "@brewdocs.beer/core";
import {Plus} from "@/components/svg";

export function DataGridAddButton({ className, onClick }: PropsWithClass & PropsWithOnClick) {
    return (
        <button onClick={onClick as MouseEventHandler<HTMLButtonElement>} className={classNames("btn btn-xs p-0 m-0 btn-ghost absolute left-1.5 top-1.5", [className])}>
            <Plus className="w-4" />
        </button>
    );
}
