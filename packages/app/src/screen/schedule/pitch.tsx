import {ScreenH3} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import Yeast from "@/model/yeast";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import sessionState, {useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type SchedulePitchProps = {
    yeast: Yeast[];
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function SchedulePitch({ yeast, update, updateScalar }: SchedulePitchProps) {
    const session = useSession();

    return (
        <>
            <Collapse
                toggle={(open: boolean) => sessionState.set(`schedule.pitch`, open)}
                key={"pitch"}
                title={"4. Pitch"}
                className="lg:collapse-open"
                openInitial={session[`schedule.pitch`] ?? true}>
                <DataGrid>
                    {yeast.map((yeast: Yeast, i) => (
                        <DataGridRow key={`yeast-${yeast.name}-${i}`}>
                            <DataGridLabel className="cozy">{yeast.name}</DataGridLabel>
                            <DataGridInput
                                col={3}
                                value={yeast.temp.value}
                                onChange={(value: string) => update(`yeast[${i}].temp.value`, value)}
                                onBlur={(value: string) => updateScalar(`yeast[${i}].temp`, value)}
                            />
                        </DataGridRow>
                    ))}
                </DataGrid>
            </Collapse>
        </>
    )
}