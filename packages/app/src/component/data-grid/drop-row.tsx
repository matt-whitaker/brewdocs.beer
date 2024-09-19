import {PropsWithClass} from "@brewdocs.beer/core";
import {PropsWithChildren, useState} from "react";
import classNames from "classnames";

export type DataGridDropRowProps = PropsWithClass & PropsWithChildren & {
    onDrop?: (data) => void;
}
export default function DataGridDropRow({ className, children }: DataGridDropRowProps) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const onDragOver = (e) => {
        e.preventDefault(); // Prevents default drop behavior
        setIsDraggingOver(true);
    };

    const onDrop = (e) => {
        console.log("drop! ", e);
        setIsDraggingOver(false);
    };

    return (
        <li
            className={classNames(
                "w-full h-1 bg-blue-200 hover:h-20 transition-all duration-300 flex items-center justify-center",
                isDraggingOver ? "bg-blue-300" : "",
                className
            )}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={() => setIsDraggingOver(false)}
            // onTouchMove={(e) => e.preventDefault()} // Prevent scroll while dragging
        >
            {children}
        </li>
    );
}