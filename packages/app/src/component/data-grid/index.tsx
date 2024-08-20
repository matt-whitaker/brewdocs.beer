import {PropsWithChildren} from "react";

export default function DataGrid({ children }: PropsWithChildren) {
    return (
        <ul className="grid">{children}</ul>
    );
}