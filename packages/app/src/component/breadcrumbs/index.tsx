import {Link} from "@tanstack/react-router";
import classNames from "classnames";
import {ReactNode, Suspense} from "react";
import {CrumbLink, DynamicCrumb, isDynamic, StaticCrumb} from "@/model/crumb";
import {useBreadcrumbTrail} from "@/providers/breadcrumbs";

// the label is wrapped in a real element so it can ellipsize: daisyui makes both
// `li` and `li > *` display:flex, and text-overflow never applies to a flex box's
// anonymous text — a bare string had nothing to truncate. min-w-0 lets this span
// shrink below its text, which is what actually reveals the "…".
const CrumbText = ({ children }: { children: ReactNode }) =>
    <span className="min-w-0 truncate">{children}</span>;

function CrumbAnchor({ link, children }: { link?: CrumbLink; children: ReactNode }) {
    if (!link) {
        return <CrumbText>{children}</CrumbText>;
    }

    return <Link to={link.to as never} params={link.params as never}><CrumbText>{children}</CrumbText></Link>;
}

const staticLink = (crumb: StaticCrumb | DynamicCrumb): CrumbLink | undefined =>
    crumb.to ? { to: crumb.to, params: crumb.params } : void 0;

/**
 * Runs the crumb's data hook **once** (may suspend) and renders both its label and
 * its link. A data-derived `link` needs the same `load()` result the label came
 * from, so the anchor decision has to happen inside the Suspense boundary rather
 * than outside it — that's what lets a crumb point at a route it can't know until
 * the data arrives (e.g. a batch's recipe, kb vs user).
 */
function DynamicCrumbContent({ crumb }: { crumb: DynamicCrumb }) {
    const data = crumb.load();
    return (
        <CrumbAnchor link={crumb.link ? crumb.link(data) : staticLink(crumb)}>
            {crumb.transform(data)}
        </CrumbAnchor>
    );
}

export default function Breadcrumbs() {
    const crumbs = useBreadcrumbTrail();
    if (crumbs.length === 0) {
        return null;
    }

    return (
        <div className={classNames(
            "breadcrumbs text-xs shrink-0 overflow-hidden self-stretch px-2 ml-2 lg:ml-4 lg:px-4",
            "uppercase tracking-wide font-semibold text-base-content/60",

            "[&_li]:min-w-0 [&_li>*]:min-w-0",

            "[&_li+li]:before:shrink-0 [&_li+li]:before:rotate-0 [&_li+li]:before:border-0",
            "[&_li+li]:before:size-1 [&_li+li]:before:rounded-full [&_li+li]:before:bg-current [&_li+li]:before:mx-2"
        )}>
            <ul>
                {crumbs.map((crumb, i) => (

                    <li key={`${i}:${isDynamic(crumb) ? crumb.key : crumb.label}`}>
                        {isDynamic(crumb)
                            ? (
                                <Suspense fallback={<CrumbText><span className="opacity-50">…</span></CrumbText>}>
                                    <DynamicCrumbContent crumb={crumb} />
                                </Suspense>
                            )
                            : <CrumbAnchor link={staticLink(crumb)}>{crumb.label}</CrumbAnchor>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
