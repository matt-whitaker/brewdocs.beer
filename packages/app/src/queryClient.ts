import {QueryClient} from "@tanstack/react-query";

// all queries here are only ever invalidated explicitly (after a save/mutation);
// nothing changes on its own, so there's no reason to treat cached data as stale
// and opportunistically refetch on remount/window focus/reconnect
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity
        }
    }
});
export default queryClient;
