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
    // dynamic runtime path — cast past the router's typed `to`
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
    // shrink-0: DrawerContent is a fixed-height (h-full) flex column whose children
    // (breadcrumbs + the h-full panel switcher) overflow it, so flex-shrink squeezes
    // this box below its content height — and the squeeze varies with the active
    // panel's height, which nudged the tab bar by ~1px on tab switches. Pinning
    // flex-shrink to 0 keeps the breadcrumb at its natural height so nothing moves.
    // self-stretch: pins the box to the available width instead of shrink-wrapping
    // its content, so the trail has a max width to truncate against. It also handles
    // the left-alignment that `self-start` used to (DrawerContent centers its column
    // via items-center) — a full-width box has nothing left to center. Note this is
    // the *cross* axis of that column, so it doesn't disturb the shrink-0 above.
    // overflow-hidden: replaces daisyui's `.breadcrumbs { overflow-x: auto }`, which
    // would scroll the row sideways instead of letting the crumbs ellipsize. Setting
    // both axes also keeps the old fix — with only one axis non-visible, the other
    // computes to auto and resurrects the stray vertical scrollbar on mobile.
    // The `[&_li]` rules make truncation reachable: flex items default to
    // min-width:auto (can't shrink below content), and the `>` separator is a
    // fixed-size ::before flex item that must not be squeezed away.
    return (
        <div className={classNames(
            "breadcrumbs text-xs shrink-0 overflow-hidden self-stretch px-2 ml-2 lg:ml-4 lg:px-4",
            "uppercase tracking-wide font-semibold text-base-content/60",
            // truncation: flex items can't shrink below their content without min-w-0
            "[&_li]:min-w-0 [&_li>*]:min-w-0",
            // separator: daisyui draws a chevron — a .375rem box with only its top and
            // right borders, rotated 45deg. Undo the rotation and borders and fill it
            // instead to get a bullet, which reads as a peer list rather than a strict
            // hierarchy. shrink-0 keeps it from being squeezed away when crumbs truncate.
            // ⚠️ Scope to `li+li`, never a bare `li`: any before: utility injects
            // content:"" and so *creates* a ::before box, which would put a leading
            // separator on the first crumb. daisyui scopes its own chevron the same way.
            "[&_li+li]:before:shrink-0 [&_li+li]:before:rotate-0 [&_li+li]:before:border-0",
            "[&_li+li]:before:size-1 [&_li+li]:before:rounded-full [&_li+li]:before:bg-current [&_li+li]:before:mx-2"
        )}>
            <ul>
                {crumbs.map((crumb, i) => (
                    // key by identity, not bare index: a dynamic crumb hosts a data
                    // hook, so reusing a fiber across crumbs whose hooks differ in
                    // count throws "rendered more hooks…" (index prefix keeps sibling
                    // keys unique when two crumbs share a label)
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
