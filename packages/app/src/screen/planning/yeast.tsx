import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Yeast from "@/model/yeast";
import DataGrid from "@/component/data-grid";
import {Fragment} from "react";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import {useKbYeasts} from "@/state/kbYeasts";
import DataGridInput from "@/component/data-grid/input";
import AddRow from "@/component/data-grid/add-row";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import Collapse from "@/component/collapse";

export type PlanningYeastProps = {
    yeast: Yeast[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function PlanningYeast({ yeast, add, remove, update, updateScalar }: PlanningYeastProps) {
    const session = useSession();
    const kbYeasts = useKbYeasts();
    const kbYeastsIndex = useIndexBy(kbYeasts, "name");

    if (!kbYeasts || !kbYeastsIndex) {
        return null;
    }

    return (
        <>
            <Collapse
                toggle={(open: boolean) => saveSession(`planning.yeast`, open)}
                key={"yeast"}
                title={"Yeast"}
                className="lg:collapse-open"
                openInitial={session[`planning.yeast`] ?? true}>
                <DataGrid>
                    {yeast.map((yeast: Yeast, i) => (
                        <Fragment key={`yeast-${yeast.name}-${i}`}>
                            <DataGridRow>
                                <DataGridLabel className="ml-6">
                                    <DataGridRemoveButton onClick={() => remove("yeast", i)} />
                                    <DataGridSelect
                                        data={kbYeasts.map((({ name }) => ({ value: name, name })))}
                                        value={yeast.name}
                                        onChange={(value: string) => update(`yeast[${i}]`, kbYeastsIndex!.get(value)!)}
                                    />
                                </DataGridLabel>
                                <DataGridInput
                                    col={3}
                                    value={yeast.temp.value}
                                    onChange={(value: string) => update(`yeast[${i}].temp.value`, value)}
                                    onBlur={(value: string) => updateScalar(`yeast[${i}].temp`, value)}
                                />
                            </DataGridRow>
                            {/*<FormCheckbox onChange={() => toggle(`yeast[${i}].starter`)} checked={yeast.starter}>*/}
                            {/*    Starter?*/}
                            {/*</FormCheckbox>*/}
                        </Fragment>
                    ))}
                    <AddRow<Yeast>
                        data={kbYeasts}
                        add={(value: string) => add("yeast", kbYeastsIndex!.get(value)!)}
                    />
                </DataGrid>
            </Collapse>
        </>
    )
}