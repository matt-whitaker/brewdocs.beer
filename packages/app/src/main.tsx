import ReactDOM from "react-dom/client";
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {QueryClientProvider} from "@tanstack/react-query";
import {registerSW} from "virtual:pwa-register";
import {routeTree} from "./routeTree.gen";
import queryClient from "./queryClient";

import "@fontsource-variable/urbanist";
import "./styles.css";

const router = createRouter({
    routeTree,
    defaultPreload: "intent"
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

registerSW({immediate: true});

// no StrictMode: mutation actions are fire-and-forget and must not double-fire
ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
);
