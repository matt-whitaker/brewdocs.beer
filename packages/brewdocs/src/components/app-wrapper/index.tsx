import {PropsWithChildren} from "react";

export default function AppWrapper({ children }: PropsWithChildren) {
    return <div className="mx-auto max-w-[860px]">{children}</div>;
}