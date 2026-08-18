import {createFileRoute} from "@tanstack/react-router";
import {Suspense, useMemo} from "react";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/providers/breadcrumbs";
import Loading from "@/screen/loading";
import YeastOverview from "@/screen/yeast-overview";
import {useKbYeast} from "@/state/kbYeasts";

export const Route = createFileRoute("/kb/yeast/$yeastId")({
    component: KbYeastPage
});

// Read-only catalog (KbYeast) view. No PanelSwitcher here, so this route
// needs its own Suspense boundary for a cold deep-link before boot prefetch resolves.
function KbYeastPage() {
    const {yeastId} = Route.useParams();

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Knowledge", to: "/knowledge" },
        { label: "Yeasts" },
        dynamicCrumb(useKbYeast, [yeastId], ({ name }) => name),
    ], [yeastId]);
    useBreadcrumbs(breadcrumbs);

    return (
        <Suspense fallback={<Loading />}>
            <YeastOverview yeastId={yeastId} />
        </Suspense>
    );
}
