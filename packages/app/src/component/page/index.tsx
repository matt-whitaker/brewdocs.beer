import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import Shell from "../shell";

export type PageProps = PropsWithChildren & Partial<PropsWithClass>;

export default function Page({ children }: PageProps) {
    return (
        <Shell>
            {children}
        </Shell>
    );
}