import {createFileRoute} from "@tanstack/react-router";
import {Suspense, useMemo} from "react";
import {Crumb, dynamicCrumb} from "@/model/crumb";
import {useBreadcrumbs} from "@/providers/breadcrumbs";
import Loading from "@/screen/loading";
import YeastOverview from "@/screen/yeast-overview";
import {useKbYeast} from "@/state/kbYeasts";

export const Route = createFileRoute("/kb/yeast/$yeastId")({
    component: KbYeastPage
});

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
