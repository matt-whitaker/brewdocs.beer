import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbEquipment} from "@brewdocs.beer/kb";
import queryClient from "@/queryClient";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";

export const kbEquipmentQueryKey = () => ["kb", "equipment"];
export const fetchKbEquipment = async (): Promise<KbEquipment[]> => {
    const cached = await kbStorage.getResource("equipment");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Equipment data isn't downloaded yet, and you're offline.");
    }

    const equipment = await importResource("equipment");
    return kbStorage.saveResource("equipment", equipment);
};

export const prefetchKbEquipment = () => queryClient.prefetchQuery({ queryKey: kbEquipmentQueryKey(), queryFn: fetchKbEquipment });

export const useKbEquipment = (): KbEquipment[] => {
    const { data } = useSuspenseQuery({ queryKey: kbEquipmentQueryKey(), queryFn: fetchKbEquipment });

    if (!data) {
        throw new Error("Unable to load equipment from Knowledge Base");
    }

    return data;
};

export const useKbEquipmentItem = (id: string): KbEquipment => {
    const { data } = useSuspenseQuery({ queryKey: kbEquipmentQueryKey(), queryFn: fetchKbEquipment });
    const item = data?.find(item => item.id === id);

    if (!item) {
        throw new Error("Unable to load equipment item from Knowledge Base");
    }

    return item;
};
