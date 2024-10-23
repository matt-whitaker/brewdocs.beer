import classNames from "classnames";

export type FormSelectProps = { className?: string; data: string[] }
export default function FormSelect({ className, data }: FormSelectProps) {
    return (
        <select className={classNames([className])}>
            {data.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
    )
}