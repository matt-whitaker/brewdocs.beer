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
    // overflow-y-hidden: daisyui's `.breadcrumbs` sets overflow-x:auto, which makes
    // overflow-y compute to auto too — on mobile that surfaces a stray vertical
    // scrollbar when the trail overflows horizontally
    return (
        <div className="breadcrumbs text-sm overflow-y-hidden">
            <ul>
                {crumbs.map((crumb, i) => (
                    <li key={i}>
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
