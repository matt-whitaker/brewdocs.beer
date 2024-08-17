import classNames from "classnames";

export type InputGridProps = {
    inputs: ([string, [string, string?, string?], boolean?, boolean?])[];
    onChange?: (output: [string, [string, string?, string?]]) => void;
}

const colStarts = ["col-start-2", "col-start-3", "col-start-4", "col-start-5"];
const colSpans = ["col-span-3", "col-span-2", "col-span-1"];

export default function InputGrid({ inputs }: InputGridProps) {
    return (
        <ul className="grid gap-y-2">
            {inputs.map(([title, values, readonly = false, renamable = true]) => (
                <li className="grid grid-cols-5 gap-x-2">
                    {renamable
                        ? <input title={title} type="text" className="whitespace-nowrap leading-8 input sm:input-md input-sm input-ghost col-span-2" value={title} />
                        : <span className="text-sm whitespace-nowrap leading-8 ml-4 col-span-2">{title}</span>}
                    {values.map((value, i) => (
                        !readonly
                            ? <input
                                type="text"
                                className={classNames(
                                    colStarts[colStarts.length - values.length + i],
                                    "px-2 col-span-1 input input-bordered sm:input-md input-sm text-right placeholder:text-right")}
                                placeholder={value} />
                            : <input
                                type="text"
                                className={classNames(colStarts[3], "px-2 input input-ghost sm:input-md input-sm text-right")}
                                value={values[0]} />
                    ))}
                </li>
            ))}
        </ul>
    )
}