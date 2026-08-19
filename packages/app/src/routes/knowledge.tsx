import {createFileRoute} from "@tanstack/react-router";
import {Crumb} from "@/model/crumb";
import {useBreadcrumbs} from "@/providers/breadcrumbs";

const BREADCRUMBS: Crumb[] = [{ label: "Knowledge" }];

export const Route = createFileRoute("/knowledge")({
    component: KnowledgePage
});

function KnowledgePage() {
    useBreadcrumbs(BREADCRUMBS);

    return <p>Page not implemented</p>;
}
