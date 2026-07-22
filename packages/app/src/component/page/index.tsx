import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import Shell from "@/component/shell";

export type PageProps = PropsWithChildren & Partial<PropsWithClass>;

export default function Page({ children }: PageProps) {
    return (
        <Shell>
            {children}
        </Shell>
    );
}