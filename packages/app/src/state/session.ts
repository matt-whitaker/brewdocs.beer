import {useSuspenseQuery} from "@tanstack/react-query";
import sessionStorage, {SessionValue} from "@/storage/session";
import queryClient from "@/queryClient";


export type Session = Record<string, SessionValue>

export const sessionQueryKey = () => ["session"];
export const fetchSession = async (): Promise<Session> => sessionStorage.index()

export const useSession = (): Session => {
    const { data } = useSuspenseQuery({ queryKey: sessionQueryKey(), queryFn: fetchSession });
    return data ?? {}
}

export const saveSession = async (id: string, value: SessionValue) => {
    await sessionStorage.save(id, value);
    await queryClient.invalidateQueries({ queryKey: sessionQueryKey() });
}
