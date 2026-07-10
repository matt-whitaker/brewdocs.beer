import {useQuery} from "@tanstack/react-query";
import sessionStorage from "@/storage/settings";
import queryClient from "@/queryClient";

export type Session = Record<string, boolean>

const sessionQueryKey = ["session"] as const;

export const useSession = () => useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => sessionStorage.index() as Promise<Session>
}).data ?? {};

async function set(id: string, value: boolean) {
    await sessionStorage.save(id, value);
    await queryClient.invalidateQueries({queryKey: sessionQueryKey});
}

const sessionState = {set};
export default sessionState;
