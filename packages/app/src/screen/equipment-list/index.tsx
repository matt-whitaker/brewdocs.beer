import {useMemo, useState} from "react";
import ErrorBoundary from "@/component/error-boundary";
import Screen from "@/component/screen";
import SearchBar from "@/component/search-bar";
import EquipmentListItem, {EquipmentListItemFallback} from "@/screen/equipment-list/item";
import {useKbEquipment} from "@/state/kbEquipment";
import {useUserEquipment} from "@/state/userEquipment";

export type EquipmentListProps = {
    source: "all"|"user"|"kb"
};

export default function EquipmentList({ source = "all" }: EquipmentListProps) {
    const userEquipment = useUserEquipment();
    const kbEquipment = useKbEquipment();
    const [query, setQuery] = useState("");

    const shownEquipment = useMemo(() => {
        const kb = kbEquipment.map((equipment) => ({ equipment, source: "kb" as const }));
        const user = userEquipment.map((equipment) => ({ equipment, source: "user" as const }));
        const bySource = {
            "all": [...kb, ...user],
            "user": user,
            "kb": kb
        }[source].filter(({ equipment }) => !!equipment);

        const q = query.trim().toLowerCase();
        return q ? bySource.filter(({ equipment }) => equipment.name.toLowerCase().includes(q)) : bySource;
    }, [userEquipment, kbEquipment, source, query]);

    const equipmentListItems = useMemo(() => shownEquipment.map(({ equipment, source: equipmentSource }) => (
        <ErrorBoundary key={`${equipmentSource}:${equipment.id}`} fallback={<EquipmentListItemFallback />}>
            <EquipmentListItem
                equipment={equipment}
                source={equipmentSource}
            />
        </ErrorBoundary>
    )), [shownEquipment]);

    return (
        <Screen>
            <SearchBar value={query} onChange={setQuery} label="Search equipment" />
            <ul className="w-full menu px-0">
                {equipmentListItems}
            </ul>
        </Screen>
    );
}
