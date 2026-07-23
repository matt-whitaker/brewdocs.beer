import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import HopOverview from "@/screen/hop-overview";
import Loading from "@/screen/loading";

export const Route = createFileRoute("/kb/hop/$hopId")({
    component: KbHopPage
});

// Read-only catalog (KbHop) view. No PanelSwitcher here, so this route
// needs its own Suspense boundary for a cold deep-link before boot prefetch resolves.
function KbHopPage() {
    const {hopId} = Route.useParams();

    return (
        <Suspense fallback={<Loading />}>
            <HopOverview hopId={hopId} />
        </Suspense>
    );
}
