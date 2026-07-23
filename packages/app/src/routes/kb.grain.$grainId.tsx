import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import GrainOverview from "@/screen/grain-overview";
import Loading from "@/screen/loading";

export const Route = createFileRoute("/kb/grain/$grainId")({
    component: KbGrainPage
});

function KbGrainPage() {
    const {grainId} = Route.useParams();

    return (
        <Suspense fallback={<Loading />}>
            <GrainOverview grainId={grainId} />
        </Suspense>
    );
}
