import {createFileRoute} from "@tanstack/react-router";
import {Suspense, useMemo} from "react";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/providers/breadcrumbs";
import GrainOverview from "@/screen/grain-overview";
import Loading from "@/screen/loading";
import {useKbGrain} from "@/state/kbGrains";

export const Route = createFileRoute("/kb/grain/$grainId")({
    component: KbGrainPage
});

function KbGrainPage() {
    const {grainId} = Route.useParams();

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Knowledge", to: "/knowledge" },
        { label: "Grains" },
        dynamicCrumb(useKbGrain, [grainId], ({ name }) => name),
    ], [grainId]);

    useBreadcrumbs(breadcrumbs);

    return (
        <Suspense fallback={<Loading />}>
            <GrainOverview grainId={grainId} />
        </Suspense>
    );
}
