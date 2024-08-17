import {PropsWithChildren} from "react";

export default function Row({ children }: PropsWithChildren) {
    return (
        <li className="grid grid-cols-5 gap-x-2">{children}</li>
    )
}