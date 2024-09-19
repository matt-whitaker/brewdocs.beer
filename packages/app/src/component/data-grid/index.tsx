import {PropsWithChildren} from "react";

export default function DataGrid({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col">{children}</div>
    );
}