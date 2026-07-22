import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {createRootRoute, Outlet} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import DbCleanup from "@/component/db-cleanup";
import Shell from "@/component/shell";
import {DEV_TOOLS} from "@/utils/env";

export const Route = createRootRoute({
    component: RootLayout
});

function RootLayout() {
    return (
        <>
            <Shell>
                <DbCleanup />
                <Outlet />
            </Shell>
            {DEV_TOOLS && <TanStackRouterDevtools />}
            {DEV_TOOLS && <ReactQueryDevtools />}
        </>
    );
}
