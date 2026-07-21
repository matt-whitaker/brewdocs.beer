import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbYeast} from "@brewdocs.beer/kb";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import queryClient from "@/queryClient";

const kbYeastsQueryKey = () => ["kb", "yeasts"];
const fetchKbYeasts = async (): Promise<KbYeast[]> => {
    const cached = await kbStorage.getResource("yeasts");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Yeasts data isn't downloaded yet, and you're offline.");
    }

    const yeasts = await importResource("yeasts");
    return kbStorage.saveResource("yeasts", yeasts);
};

export const prefetchKbYeasts = () => queryClient.prefetchQuery({ queryKey: kbYeastsQueryKey(), queryFn: fetchKbYeasts });

export const useKbYeasts = (): KbYeast[] => {
    const { data } = useSuspenseQuery({ queryKey: kbYeastsQueryKey(), queryFn: fetchKbYeasts });

    if (!data) {
        throw new Error("Unable to load yeasts from Knowledge Base");
    }

    return data;
};
