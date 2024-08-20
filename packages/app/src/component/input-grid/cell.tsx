import classNames from "classnames";

export type CellProps = {
    value: string;
    readonly?: boolean;
    col: number;
};

const colStarts = ["col-start-3", "col-start-4", "col-start-5"];
// const colSpans = ["col-span-3", "col-span-2", "col-span-1"];

export default function Cell({ readonly, col, value }: CellProps) {
    return (
        !readonly
            ? <input
                type="text"
                className={classNames(
                    colStarts[col - 1],
                    "self-center px-2 col-span-1 input input-bordered lg:input-md input-xs text-right placeholder:text-right")}
                placeholder={value} />
            : <input
                type="text"
                className={classNames(colStarts[2], "self-center px-2 input input-ghost lg:input-md input-xs text-right")}
                value={value} />
    );
}