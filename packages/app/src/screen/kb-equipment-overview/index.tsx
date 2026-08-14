import {ScreenP} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import {useKbEquipmentItem} from "@/state/kbEquipment";

export type KbEquipmentOverviewProps = { equipmentId: string };
export default function KbEquipmentOverview({ equipmentId }: KbEquipmentOverviewProps) {
    const equipment = useKbEquipmentItem(equipmentId);

    return (
        <Screen>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2 pt-2">
                {equipment.count != null && <ScreenP className="pt-2">Quantity {equipment.count}</ScreenP>}
                <ScreenP className="pt-4">{equipment.notes}</ScreenP>
            </div>
        </Screen>
    );
}
