import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import Hero from "@/component/hero";
import EverywhereSearch from "@/screen/everywhere-search";
import Loading from "@/screen/loading";

export const Route = createFileRoute("/")({
    component: HomePage
});

function HomePage() {
    return (
        <Hero>
            <Suspense fallback={<Loading />}>
                <EverywhereSearch />
            </Suspense>
        </Hero>
    );
}
