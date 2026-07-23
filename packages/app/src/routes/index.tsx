import {createFileRoute} from "@tanstack/react-router";
import {Crumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import Hero from "@/component/hero";

// module const so the array is stable across renders (see useBreadcrumbs)
const BREADCRUMBS: Crumb[] = [{ label: "Home" }];

export const Route = createFileRoute("/")({
    component: HomePage
});

function HomePage() {
    useBreadcrumbs(BREADCRUMBS);

    return (
        <Hero>
            <div className="max-w-md">
                <h1 className="text-5xl font-bold mb-5">Welcome back!</h1>
                <b className="hidden lg:block">Note: Best used on mobile</b>
                {/*[Cool HUD / Dashboard]*/}
            </div>
        </Hero>
    );
}
