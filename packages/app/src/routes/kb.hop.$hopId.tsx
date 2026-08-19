import {createFileRoute} from "@tanstack/react-router";
import {Suspense, useMemo} from "react";
import {Crumb, dynamicCrumb} from "@/model/crumb";
import {useBreadcrumbs} from "@/providers/breadcrumbs";
import HopOverview from "@/screen/hop-overview";
import Loading from "@/screen/loading";
import {useKbHop} from "@/state/kbHops";

export const Route = createFileRoute("/kb/hop/$hopId")({
    component: KbHopPage
});

// Read-only catalog (KbHop) view. No PanelSwitcher here, so this route
// needs its own Suspense boundary for a cold deep-link before boot prefetch resolves.
function KbHopPage() {
    const {hopId} = Route.useParams();

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Knowledge", to: "/knowledge" },
        { label: "Hops" },
        dynamicCrumb(useKbHop, [hopId], ({ name }) => name),
    ], [hopId]);
    useBreadcrumbs(breadcrumbs);

    return (
        <Suspense fallback={<Loading />}>
            <HopOverview hopId={hopId} />
        </Suspense>
    );
}
