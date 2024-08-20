import {PropsWithChildren} from "react";

export default function DataGridLabel({ children, editable = false }: PropsWithChildren & { editable: boolean; }) {
    return <span className="text-sm whitespace-nowrap leading-6 lg:leading-8 ml-4 col-span-3">{children}</span>;
}