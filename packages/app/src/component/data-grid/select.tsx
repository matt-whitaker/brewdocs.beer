import classNames from "classnames";

export type DataGridSelectProps = { className?: string; data: { name: string }[]; value: string }
export default function DataGridSelect({ className, data, value }: DataGridSelectProps) {
    return (
        <select className={classNames("col-span-4 select select-xs select-bordered w-full", [className])}>
            {data.map((d) => <option value={d.name} selected={value === d.name}>{d.name}</option>)}
        </select>
    );
}