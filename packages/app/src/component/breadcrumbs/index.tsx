import {Link} from "@tanstack/react-router";
import {ReactNode, Suspense, useCallback, useMemo, useState} from "react";
import {BreadcrumbContext, Crumb, DynamicCrumb, isDynamic, useBreadcrumbTrail} from "@/component/breadcrumbs/context";

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    // a Map preserves insertion order, which is what the reverse in
    // useBreadcrumbTrail relies on
    const [groups, setGroups] = useState<Map<string, Crumb[]>>(() => new Map());

    const register = useCallback((id: string, crumbs: Crumb[]) => {
        // set on an existing id updates its value but keeps its slot
        setGroups((prev) => new Map(prev).set(id, crumbs));
    }, []);

    const unregister = useCallback((id: string) => {
        setGroups((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const value = useMemo(() => ({ register, unregister, groups }), [register, unregister, groups]);
    return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

// runs the crumb's data hook (may suspend — wrapped in Suspense by CrumbLabel)
function DynamicLabel({ crumb }: { crumb: DynamicCrumb }) {
    return <>{crumb.transform(crumb.load())}</>;
}

function CrumbLabel({ crumb }: { crumb: Crumb }): ReactNode {
    if (isDynamic(crumb)) {
        return (
            <Suspense fallback={<span className="opacity-50">…</span>}>
                <DynamicLabel crumb={crumb} />
            </Suspense>
        );
    }
    return crumb.label;
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
    // overflow-y-hidden: daisyui's `.breadcrumbs` sets overflow-x:auto, which makes
    // overflow-y compute to auto too — on mobile that surfaces a stray vertical
    // scrollbar when the trail overflows horizontally.
    // self-start: DrawerContent centers its column (items-center); without this the
    // shrink-width breadcrumb box would sit centered instead of left-aligned.
    return (
        <div className="breadcrumbs text-xs shrink-0 overflow-y-hidden self-start px-2 ml-2 lg:ml-4 lg:px-4 uppercase tracking-wide font-semibold text-base-content/60">
            <ul>
                {crumbs.map((crumb, i) => (
                    // key by identity, not bare index: a dynamic crumb hosts a data
                    // hook, so reusing a fiber across crumbs whose hooks differ in
                    // count throws "rendered more hooks…" (index prefix keeps sibling
                    // keys unique when two crumbs share a label)
                    <li key={`${i}:${isDynamic(crumb) ? crumb.key : crumb.label}`}>
                        {crumb.to
                            // dynamic runtime path — cast past the router's typed `to`
                            ? <Link to={crumb.to as never} params={crumb.params as never}><CrumbLabel crumb={crumb} /></Link>
                            : <CrumbLabel crumb={crumb} />}
                    </li>
                ))}
            </ul>
        </div>
    );
}
