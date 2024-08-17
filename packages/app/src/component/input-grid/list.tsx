import {PropsWithChildren} from "react";

export default function List({ children }: PropsWithChildren) {
    return (
        <ul className="grid gap-y-2">{children}</ul>
    );
}