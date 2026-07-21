import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbGrain} from "@brewdocs.beer/kb";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import queryClient from "@/queryClient";

const kbGrainsQueryKey = () => ["kb", "grains"];
const fetchKbGrains = async (): Promise<KbGrain[]> => {
    const cached = await kbStorage.getResource("grains");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Grains data isn't downloaded yet, and you're offline.");
    }

    const grains = await importResource("grains");
    return kbStorage.saveResource("grains", grains);
};

export const prefetchKbGrains = () => queryClient.prefetchQuery({ queryKey: kbGrainsQueryKey(), queryFn: fetchKbGrains });

export const useKbGrains = (): KbGrain[] => {
    const { data } = useSuspenseQuery({ queryKey: kbGrainsQueryKey(), queryFn: fetchKbGrains });

    if (!data) {
        throw new Error("Unable to load grains from Knowledge Base");
    }

    return data;
};
