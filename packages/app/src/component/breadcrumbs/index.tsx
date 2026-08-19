import {Link} from "@tanstack/react-router";
import classNames from "classnames";
import {ReactNode, Suspense} from "react";
import {CrumbLink, DynamicCrumb, isDynamic, StaticCrumb} from "@/model/crumb";
import {useBreadcrumbTrail} from "@/providers/breadcrumbs";

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
