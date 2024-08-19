import {PropsWithChildren} from "react";

export default function Error({ children }: PropsWithChildren) {
    return (
        <div className="text-center">
            <h1 className="text-2xl">Error</h1>
            <p>{children}</p>
        </div>
    )
}