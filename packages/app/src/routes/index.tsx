import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import Hero from "@/component/hero";
import EverywhereSearch from "@/screen/everywhere-search";
import Loading from "@/screen/loading";

export type HomeSearch = {
    search?: "everywhere";
};

export const Route = createFileRoute("/")({
    component: HomePage,
    validateSearch: (search: Record<string, unknown>): HomeSearch =>
        search.search === "everywhere" ? {search: "everywhere"} : {}
});

function HomePage() {
    const {search} = Route.useSearch();

    return (
        <Hero>
            {search === "everywhere"
                ? (
                    <Suspense fallback={<Loading />}>
                        <EverywhereSearch />
                    </Suspense>
                )
                : (
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold mb-5">Welcome back!</h1>
                        <b className="hidden lg:block">Note: Best used on mobile</b>
                    </div>
                )}
        </Hero>
    );
}
