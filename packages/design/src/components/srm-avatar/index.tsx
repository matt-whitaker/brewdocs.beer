import classNames from "classnames";
import {useMemo} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {findSrmClasses} from "./constants";

export type SrmAvatarProps = Partial<PropsWithClass> & {
    srm: number;
};

export function SrmAvatar({ srm, className }: SrmAvatarProps){
    const [bg,, outline] = useMemo(() => findSrmClasses(srm), [srm]);

    return (
        <div className={classNames(
            "flex items-center justify-center sm:w-[135px] sm:h-[155px] w-[80px] h-[100px] shadow-sm shadow-black",
            [className]
        )}>
            <div className={classNames(
                bg,
                outline, "outline outline-[2px] outline-solid outline-offset-[4px]",
                "border-white",
                "sm:w-[50px] sm:h-[100px] w-[30px] h-[60px] p-[2px]"
            )} />
        </div>
    );
}
