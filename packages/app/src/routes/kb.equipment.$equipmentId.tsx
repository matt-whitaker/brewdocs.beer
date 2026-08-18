import {createFileRoute} from "@tanstack/react-router";
import {Suspense, useMemo} from "react";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/providers/breadcrumbs";
import KbEquipmentOverview from "@/screen/kb-equipment-overview";
import Loading from "@/screen/loading";
import {useKbEquipmentItem} from "@/state/kbEquipment";

export const Route = createFileRoute("/kb/equipment/$equipmentId")({
    component: KbEquipmentPage
});

function KbEquipmentPage() {
    const {equipmentId} = Route.useParams();

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Equipment", to: "/equipment" },
        dynamicCrumb(useKbEquipmentItem, [equipmentId], ({ name }) => name),
    ], [equipmentId]);

    useBreadcrumbs(breadcrumbs);

    return (
        <Suspense fallback={<Loading />}>
            <KbEquipmentOverview equipmentId={equipmentId} />
        </Suspense>
    );
}
