import classNames from "classnames";

export type InputGridProps = {
    inputs: ([string, [string, string?, string?], boolean?, boolean?])[];
}

const colStarts = ["col-start-2", "col-start-3", "col-start-4"]

export default function InputGrid({ inputs }: InputGridProps) {
    return (
        <ul className="[&>li]:grid [&>li]:grid-cols-4 [&>li]:gap-x-2 grid gap-y-2">
            {inputs.map(([title, values, readonly = false, renamable = true]) => (
                <li>
                    {renamable
                        ? <input type="text" className="whitespace-nowrap leading-8 input sm:input-md input-sm input-ghost" value={title} />
                        : <span className="text-sm whitespace-nowrap leading-8 ml-4">{title}</span>}
                    {values.map((value, i) => (
                        !readonly
                            ? <input
                                type="text"
                                className={classNames(
                                    colStarts[3 - values.length + i],
                                    "col-span-1 input input-bordered sm:input-md input-sm text-right placeholder:text-right")}
                                placeholder={value} />
                            : <input
                                type="text"
                                className={classNames(colStarts[2], "input input-ghost sm:input-md input-sm text-right")}
                                value={values[0]} />
                    ))}
                </li>
            ))}
        </ul>
    )
}