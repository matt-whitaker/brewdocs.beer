import {PropsWithChildren} from "react";
import {ScreenH1} from "@/component/typography";

export type ContainerProps = { title: string } & PropsWithChildren
export default function Container({ children, title }: ContainerProps) {
    return (
        <div>
            <ScreenH1 className="lg:mb-4 mb-2">{title}</ScreenH1>
            <div className="flex">
                {children}
            </div>
        </div>
    )
}