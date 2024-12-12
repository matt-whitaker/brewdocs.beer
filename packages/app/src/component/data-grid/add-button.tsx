import {Plus} from "@/component/svg";
import classNames from "classnames";
import {eventValue, PropsWithClass, PropsWithOnClick} from "@brewdocs.beer/core";
import {useCallback} from "react";

export default function AddButton({ className, onClick }: PropsWithClass & PropsWithOnClick<void>) {
    const optionalProps = onClick ? { onClick: useCallback(eventValue(onClick), [onClick]) } : void 0;
    return (
        <button {...optionalProps} className={classNames("btn btn-xs p-0 m-0 btn-ghost absolute left-1.5 top-1.5", [className])}>
            <Plus className="w-4" />
        </button>
    )
}