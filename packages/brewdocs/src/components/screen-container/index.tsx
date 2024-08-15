import {PropsWithChildren} from "react";

export default function ScreenContainer({ children }: PropsWithChildren) {
    return <div className="w-full h-full p-5">{children}</div>
}