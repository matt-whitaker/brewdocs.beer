import {useSuspenseQuery} from "@tanstack/react-query";
import sessionStorage from "@/storage/settings";
import queryClient from "@/queryClient";

export type Session = Record<string, boolean>

export const sessionQueryKey = () => ["session"] as const;
export const fetchSession = async (): Promise<Session> => sessionStorage.index()

export const useSession = (): Session => {
    const { data } = useSuspenseQuery({ queryKey: sessionQueryKey(), queryFn: fetchSession });
    return data ?? {}
}

export const saveSession = async (id: string, value: boolean) => {
    await sessionStorage.save(id, value);
    await queryClient.invalidateQueries({queryKey: sessionQueryKey});
}
