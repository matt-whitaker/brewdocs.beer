import {redirect} from "@tanstack/react-router";
import {Crumb, firstCrumbLink} from "@/component/breadcrumbs/context";

export type RequireRecordOptions = {
    find: () => Promise<unknown>;
    crumbs: Crumb[];
};

export default async function requireRecord({find, crumbs}: RequireRecordOptions): Promise<void> {
    if (await find()) return;

    const {to, params} = firstCrumbLink(crumbs);
    throw redirect({to: to as never, params: params as never, replace: true});
}
