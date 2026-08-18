import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {createRootRoute, Outlet} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import Breadcrumbs from "@/component/breadcrumbs";
import DbCleanup from "@/component/db-cleanup";
import Shell from "@/component/shell";
import {BreadcrumbProvider} from "@/providers/breadcrumbs";
import {DEV_TOOLS} from "@/utils/env";

export const Route = createRootRoute({
    component: RootLayout
});

function RootLayout() {
    return (
        <BreadcrumbProvider>
            <Shell>
                <DbCleanup />
                <Breadcrumbs />
                <Outlet />
            </Shell>
            {DEV_TOOLS && <TanStackRouterDevtools />}
            {DEV_TOOLS && <ReactQueryDevtools />}
        </BreadcrumbProvider>
    );
}
