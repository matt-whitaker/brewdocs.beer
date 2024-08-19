import {useRouter} from "next/router";

export default function useParam(...params): string[] {
    const { query } = useRouter();
    return params.map((param) => query[param]);
}