
import {ScreenH3, ScreenH4} from "@brewdocs.beer/design";
import {Fragment} from "react";
import DataGrid from "@/component/data-grid";
import Hop from "@/model/hop";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridInput from "@/component/data-grid/input";
import Additive from "@/model/additive";
import Boil from "@/model/boil";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import sessionState, {Session} from "@/state/session";
import Collapse from "@/component/collapse";

export type ScheduleBoilTypes = {
    hops?: Hop[];
    //adjuncts
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    session: Session;
}
export default function ScheduleFerment({ hops, update, updateScalar, session }: ScheduleBoilTypes) {
    return (
        <>
            <Collapse
                toggle={(open: boolean) => sessionState.set(`schedule.boil`, open)}
                key={"boil"}
                title={"2. Boil"}
                className="lg:collapse-open"
                openInitial={session[`schedule.boil`] ?? true}>

                <p></p>
            </Collapse>
        </>
    );
}