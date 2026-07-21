import {Plus} from "@/component/svg";
import classNames from "classnames";
import {PropsWithClass, PropsWithOnClick} from "@brewdocs.beer/core";
import {MouseEventHandler} from "react";

export default function AddButton({ className, onClick }: PropsWithClass & PropsWithOnClick) {
    return (
        <button onClick={onClick as MouseEventHandler<HTMLButtonElement>} className={classNames("btn btn-xs p-0 m-0 btn-ghost absolute left-1.5 top-1.5", [className])}>
            <Plus className="w-4" />
        </button>
    );
}