import classNames from "classnames";
import {MouseEventHandler} from "react";
import {PropsWithClass, PropsWithOnClick} from "@brewdocs.beer/core";
import {Minus} from "@/component/svg";

export default function RemoveButton({ className, onClick }: PropsWithClass & PropsWithOnClick) {
    return (
        <button
            onClick={onClick as MouseEventHandler<HTMLButtonElement>}
            className={classNames("btn btn-xs p-0 m-0 btn-ghost absolute left-1.5 top-2", [className])}
        >
            <Minus className="w-4" />
        </button>
    );
}