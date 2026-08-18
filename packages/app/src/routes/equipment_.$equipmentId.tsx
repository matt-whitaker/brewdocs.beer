import {createFileRoute} from "@tanstack/react-router";
import {Suspense, useMemo} from "react";
import requireRecord from "@/actions/requireRecord";
import {Crumb, dynamicCrumb} from "@/model/crumb";
import {useBreadcrumbs} from "@/providers/breadcrumbs";
import queryClient from "@/queryClient";
import EquipmentOverview from "@/screen/equipment-overview";
import Loading from "@/screen/loading";
import {queryUserEquipmentItem, useUserEquipmentItem, userEquipmentItemQueryKey} from "@/state/userEquipment";

export const Route = createFileRoute("/equipment_/$equipmentId")({
    component: EquipmentPage,
    beforeLoad: ({params: {equipmentId}}) =>
        requireRecord({
            find: () => queryClient.ensureQueryData({
                queryKey: userEquipmentItemQueryKey(equipmentId),
                queryFn: queryUserEquipmentItem
            }),
            to: "/equipment"
        })
});

function EquipmentPage() {
    const {equipmentId} = Route.useParams();

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Equipment", to: "/equipment" },
        dynamicCrumb(useUserEquipmentItem, [equipmentId], ({ name }) => name),
    ], [equipmentId]);

    useBreadcrumbs(breadcrumbs);

    return (
        <Suspense fallback={<Loading />}>
            <EquipmentOverview equipmentId={equipmentId} />
        </Suspense>
    );
}
