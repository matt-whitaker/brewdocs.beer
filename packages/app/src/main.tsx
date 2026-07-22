import {QueryClientProvider} from "@tanstack/react-query";
import {createRouter, ErrorComponentProps, RouterProvider} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import {registerSW} from "virtual:pwa-register";
import Error from "@/component/error";
import {prefetchKbGrains} from "@/state/kbGrains";
import {prefetchKbHops} from "@/state/kbHops";
import {prefetchKbYeasts} from "@/state/kbYeasts";
import {prefetchRecipes} from "@/state/recipes";
import queryClient from "./queryClient";
import {routeTree} from "./routeTree.gen";

import "@fontsource-variable/urbanist";
import "./styles.css";

function RootError({error}: ErrorComponentProps) {
    return <Error>{error instanceof Error ? error.message : String(error)}</Error>;
}

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: RootError
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

registerSW({immediate: true});

// start hydrating the local kb cache as early as possible; route-level
// Suspense boundaries join this in-flight fetch instead of re-triggering it
prefetchKbGrains();
prefetchKbHops();
prefetchKbYeasts();
prefetchRecipes();

// no StrictMode: mutation actions are fire-and-forget and must not double-fire
ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
);
