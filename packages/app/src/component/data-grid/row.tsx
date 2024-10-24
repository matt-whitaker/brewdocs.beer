import {PropsWithChildren} from "react";

export default function DataGridRow({ children }: PropsWithChildren) {
    return (
        <div className="py-1 grid grid-cols-6 gap-x-1 leading-3 align-middle odd:bg-base-200 px-1">{children}</div>
    )
}