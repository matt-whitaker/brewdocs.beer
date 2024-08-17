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
                    "px-2 col-span-1 input input-bordered sm:input-md input-sm text-right placeholder:text-right")}
                placeholder={value} />
            : <input
                type="text"
                className={classNames(colStarts[2], "px-2 input input-ghost sm:input-md input-sm text-right")}
                value={value} />
    );
}