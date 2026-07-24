import {PropsWithChildren} from "react";

export type DataGridLabelNoteProps = PropsWithChildren;
export function DataGridLabelNote({ children }: DataGridLabelNoteProps) {
    return <span className="float-right pr-1 ml-1">{children}</span>;
}
