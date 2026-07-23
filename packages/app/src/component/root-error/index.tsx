import {ErrorComponentProps} from "@tanstack/react-router";
import Error from "@/component/error";

/** Router-level fallback (router `defaultErrorComponent`) for thrown suspense/render errors. */
export default function RootError({error}: ErrorComponentProps) {
    return <Error>{error instanceof Error ? error.message : String(error)}</Error>;
}
