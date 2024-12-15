import {KbHop} from "@brewdocs.beer/kb";
import {ScreenH3} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import Hop from "@/model/hop";
import {Fragment} from "react";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import kbHopsState, {useKbHops} from "@/state/kbHops";
import DataGridInput from "@/component/data-grid/input";
import AddRow from "@/component/data-grid/add-row";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import sessionState, {Session, useSession} from "@/state/session";
import Collapse from "@/component/collapse";

export type PlanningHopsProps = {
    hops: Hop[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    session: Session;
}
export default function PlanningHops({ hops, add, remove, update, updateScalar, session }: PlanningHopsProps) {
    const kbHops = useKbHops();
    const kbHopsIndex = useIndexBy(kbHops, "name");

    if (!kbHops || !kbHopsIndex) {
        return null;
    }

    return (
        <>
            <Collapse
                toggle={(open: boolean) => sessionState.set(`planning.hops`, open)}
                key={"hops"}
                title={"Hops"}
                className="lg:collapse-open"
                openInitial={session[`planning.hops`] ?? true}>
                <DataGrid>
                    {hops.map((hop: Hop, i) => (
                        <Fragment key={`hop-${hop.name}-${i}`}>
                            <DataGridRow>
                                <DataGridLabel className="ml-6">
                                    <DataGridRemoveButton onClick={() => remove("hops", i)} />
                                    <DataGridSelect
                                        data={kbHops.map((({ name }) => ({ value: name, name })))}
                                        value={hop.name}
                                        onChange={(value: string) => update(`hops[${i}]`, kbHopsState.kbToState(kbHopsIndex!.get(value)!))}
                                    />
                                </DataGridLabel>
                                <DataGridInput
                                    col={2}
                                    value={hop.weight.value}
                                    onChange={(value: string) => update(`hops[${i}].weight.value`, value)}
                                    onBlur={(value: string) => updateScalar(`hops[${i}].weight`, value)}
                                />
                                <DataGridInput
                                    col={3}
                                    value={hop.boil.value}
                                    onChange={(value: string) => update(`hops[${i}].boil.value`, value)}
                                    onBlur={(value: string) => updateScalar(`hops[${i}].boil`, value)}
                                />
                            </DataGridRow>
                        </Fragment>
                    ))}
                    <AddRow<KbHop>
                        data={kbHops}
                        add={(value: string) => add("hops", kbHopsState.kbToState(kbHopsIndex!.get(value)!))}
                    />
                </DataGrid>
            </Collapse>
        </>
    );
}