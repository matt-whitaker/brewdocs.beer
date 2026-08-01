import classNames from "classnames";
import {useMemo} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {findSrmClasses} from "@/components/srm-avatar/constants";

export type SrmTagProps = Partial<PropsWithClass> & {
    srm: number;
};

const LOWEST_SRM = 1;

export function SrmTag({ srm, className }: SrmTagProps) {
    const [bg] = useMemo(() => findSrmClasses(Number.isFinite(srm) ? srm : LOWEST_SRM), [srm]);

    return (
        <span
            aria-hidden="true"
            className={classNames(
                "inline-block shrink-0 align-middle size-3.5 rounded-full border border-base-content/20",
                bg,
                [className]
            )}
        />
    );
}
