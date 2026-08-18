import {QueryClientProvider} from "@tanstack/react-query";
import {createRouter, RouterProvider} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import {registerSW} from "virtual:pwa-register";
import MigrationGate from "@/component/migration-gate";
import RootError from "@/component/root-error";
import {prefetchKbEquipment} from "@/state/kbEquipment";
import {prefetchKbGrains} from "@/state/kbGrains";
import {prefetchKbHops} from "@/state/kbHops";
import {prefetchKbRecipes} from "@/state/kbRecipes";
import {prefetchKbRecipeTemplates} from "@/state/kbRecipeTemplates";
import {prefetchKbYeasts} from "@/state/kbYeasts";
import queryClient from "./queryClient";
import {routeTree} from "./routeTree.gen";

import "@fontsource-variable/urbanist";
import "./clock";
import "./styles.css";

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

prefetchKbGrains();
prefetchKbHops();
prefetchKbYeasts();
prefetchKbRecipes();
prefetchKbRecipeTemplates();
prefetchKbEquipment();

// TODO come back to this
// no StrictMode: mutation actions are fire-and-forget and must not double-fire
ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <MigrationGate>
            <RouterProvider router={router} />
        </MigrationGate>
    </QueryClientProvider>
);
