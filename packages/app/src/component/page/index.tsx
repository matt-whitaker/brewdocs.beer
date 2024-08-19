import {PropsWithChildren} from "react";
import Shell from "../shell";
import {PropsWithClass} from "@brewdocs.beer/core";

export type PageProps = PropsWithChildren & Partial<PropsWithClass>

export default function Page({ children, className }: PageProps) {
    return (
        <Shell className={className}>
            {children}
        </Shell>
    );
}