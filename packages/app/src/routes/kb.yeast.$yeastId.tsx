import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import Loading from "@/screen/loading";
import YeastOverview from "@/screen/yeast-overview";

export const Route = createFileRoute("/kb/yeast/$yeastId")({
    component: KbYeastPage
});

// Read-only catalog (KbYeast) view. No PanelSwitcher here, so this route
// needs its own Suspense boundary for a cold deep-link before boot prefetch resolves.
function KbYeastPage() {
    const {yeastId} = Route.useParams();

    return (
        <Suspense fallback={<Loading />}>
            <YeastOverview yeastId={yeastId} />
        </Suspense>
    );
}
