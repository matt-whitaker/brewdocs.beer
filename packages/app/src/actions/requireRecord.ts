import {redirect} from "@tanstack/react-router";

export type RequireRecordOptions = {
    find: () => Promise<unknown>;
    to: string;
};

export default async function requireRecord({find, to}: RequireRecordOptions): Promise<void> {
    if (await find()) return;

    throw redirect({to: to as never, replace: true});
}
