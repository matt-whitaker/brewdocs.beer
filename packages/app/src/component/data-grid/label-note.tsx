import {PropsWithChildren} from "react";

export type DataGridLabelNoteProps = PropsWithChildren;
export default function DataGridLabelNote({ children }: DataGridLabelNoteProps) {
    return <span className="float-right pr-1">{children}</span>
}