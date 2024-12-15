import {ScreenH4} from "@brewdocs.beer/design";
import {Fragment} from "react";
import DataGrid from "@/component/data-grid";
import Grain from "@/model/grain";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridInput from "@/component/data-grid/input";
import sessionState, {useSession} from "@/state/session";
import Collapse from "@/component/collapse";
import {Mash} from "@/model/mash";

export type ScheduleMashProps = {
    mash: Mash[];
    grains: Grain[];
};

export default function ScheduleMash({ mash, grains }: ScheduleMashProps) {
    const session = useSession();

    return (
        <>
            <Collapse
                toggle={(open: boolean) => sessionState.set(`schedule.mash`, open)}
                key={"mash"}
                title={"1. Mash"}
                className="lg:collapse-open"
                openInitial={session[`schedule.mash`] ?? true}>
                {mash.map((m, i) => (
                    <Fragment key={`mash-${m.name}-${i}`}>
                        <ScreenH4 className="cozy">{m.name} - {m.time.value}</ScreenH4>
                        <DataGrid>
                            {grains.map((grain: Grain, i) => (
                                <DataGridRow key={`grain-${grain.name}-${i}`}>
                                    <DataGridLabel>{grain.name} <DataGridLabelNote>({grain.weight.value})</DataGridLabelNote></DataGridLabel>
                                    <DataGridInput readonly value={m.temp.value} col={3} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Fragment>
                ))}
            </Collapse>
        </>
    )
}