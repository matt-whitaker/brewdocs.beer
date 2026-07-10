import ReactDOM from "react-dom/client";
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {registerSW} from "virtual:pwa-register";
import {routeTree} from "./routeTree.gen";

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

// no StrictMode: the RxJS singleton stores load on mount and must not double-fire
ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);
