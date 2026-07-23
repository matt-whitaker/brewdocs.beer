import {createFileRoute} from "@tanstack/react-router";
import {Crumb, useBreadcrumbs} from "@/component/breadcrumbs/context";

// module const so the array is stable across renders (see useBreadcrumbs)
const BREADCRUMBS: Crumb[] = [{ label: "Disclaimer" }];

export const Route = createFileRoute("/disclaimer")({
    component: DisclaimerPage
});

function DisclaimerPage() {
    useBreadcrumbs(BREADCRUMBS);

    return (
        <div className="max-w-md p-5">
            <p>BrewDocs is currently in an early prototyping phase, and thus is not considered stable. It is mostly deployed for demo purposes.</p>
            <div className="divider divider-secondary"></div>
            <p>If you run into issues with it, you can use the button below to perform a wipe and start fresh.</p>
            <p><a className="btn btn-primary btn-sm mt-1" href="/?purge=true">Purge Data</a></p>
        </div>
    );
}
