import queryStorage, {QueryValue} from "@/storage/query";
import {useSuspenseQuery} from "@tanstack/react-query";
import queryClient from "@/queryClient";

export type QueryParams = Record<string, QueryValue>;

export const queryParamsQueryKey = () => ["query-params"];
export const fetchQueryParams = async (): Promise<QueryParams> => queryStorage.index();

export const useQueryParams = (): QueryParams => {
    const { data } = useSuspenseQuery(({ queryKey: queryParamsQueryKey(), queryFn: fetchQueryParams }));
    return data ?? {};
};

export const saveQueryParams = async (id: string, value: QueryValue) => {
    await queryStorage.save(id, value);
    await queryClient.invalidateQueries(({ queryKey: queryParamsQueryKey() }));
};