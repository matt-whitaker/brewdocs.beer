
export type FormSelectProps = { className?: string }
export default function FormSelect({ className }: FormSelectProps) {
    return (
        <select className={classNames("col-span-4", [className])}>
            <option>Maris Otter - 2 Row</option>
            <option>Crystal 40L</option>
        </select>
    )
}