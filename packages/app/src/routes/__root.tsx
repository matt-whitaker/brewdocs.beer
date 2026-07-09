import {createRootRoute, Outlet} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import Shell from "@/component/shell";
import DbCleanup from "@/component/db-cleanup";
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
        </>
    );
}
