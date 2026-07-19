import {PropsWithChildren} from "react";

export default function DataGrid({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col data-grid [.data-grid_&]:pt-1">{children}</div>
    );
}