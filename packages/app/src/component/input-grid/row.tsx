import {PropsWithChildren} from "react";

export default function Row({ children }: PropsWithChildren) {
    return (
        <li className="grid grid-cols-6 gap-x-1 leading-3 align-middle odd:bg-base-200">{children}</li>
    )
}