import classNames from "classnames";
import {InputSelect, InputSelectOption} from "@brewdocs.beer/design/src/components/input-select";

export type DataGridSelectProps = { className?: string; data: InputSelectOption[]; value: string }
export default function DataGridSelect({ className, data, value }: DataGridSelectProps) {
    return <InputSelect className={classNames("col-span-4 w-full", [className])} value={value} data={data}/>;
}