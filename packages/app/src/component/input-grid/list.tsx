import {PropsWithChildren} from "react";

export default function List({ children }: PropsWithChildren) {
    return (
        <ul className="grid gap-y-0 lg:gap-y-1">{children}</ul>
    );
}