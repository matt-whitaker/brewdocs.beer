import {PropsWithChildren} from "react";
import Shell from "../shell";
import {PropsWithOptionalClass} from "@/component/prop-types";

export type PageProps = PropsWithChildren & PropsWithOptionalClass

export default function Page({ children, className }: PageProps) {
    return (
        <Shell className={className}>
            {children}
        </Shell>
    );
}