import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbHop} from "@brewdocs.beer/kb";
import queryClient from "@/queryClient";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";

const kbHopsQueryKey = () => ["kb", "hops"];
export const fetchKbHops = async (): Promise<KbHop[]> => {
    const cached = await kbStorage.getResource("hops");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Hops data isn't downloaded yet, and you're offline.");
    }

    const hops = await importResource("hops");
    return kbStorage.saveResource("hops", hops);
};

export const prefetchKbHops = () => queryClient.prefetchQuery({ queryKey: kbHopsQueryKey(), queryFn: fetchKbHops });

export const useKbHops = (): KbHop[] => {
    const { data } = useSuspenseQuery({ queryKey: kbHopsQueryKey(), queryFn: fetchKbHops });

    if (!data) {
        throw new Error("Unable to load hops from Knowledge Base");
    }

    return data;
};

export const useKbHop = (id: string): KbHop => {
    const { data } = useSuspenseQuery({ queryKey: kbHopsQueryKey(), queryFn: fetchKbHops });
    const hop = data?.find(hop => hop.id === id);

    if (!hop) {
        throw new Error("Unable to load hop from Knowledge Base");
    }

    return hop;
};
