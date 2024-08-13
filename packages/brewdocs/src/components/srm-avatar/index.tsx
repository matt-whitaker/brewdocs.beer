import {SRM_TO_HEX} from "@brewdocs/components/srm-avatar/constants";
import {useMemo} from "react";
import classNames from "classnames";

export interface SrmAvatarProps {
    srm: number;
}

function findHexClasses(srm: number) {
    for (const [key, hex] of SRM_TO_HEX) {
        if (srm <= key) {
            return hex;
        }
    }

    return SRM_TO_HEX.get(40);
}

export default function SrmAvatar({ srm }: SrmAvatarProps){
    const [bg,, outline] = useMemo(() => findHexClasses(srm), [srm]);

    // 64 wide 112 tall
    return (
        <div className="flex items-center justify-center sm:w-[135px] sm:h-[155px] w-[80px] h-[100px] shadow shadow-black">
            <div className={classNames(
                bg,
                outline, "outline outline-[2px] outline-solid outline-offset-[4px]",
                "border-white",
                "sm:w-[50px] sm:h-[100px] w-[30px] h-[60px] p-[2px]"
            )} />
        </div>
    )
}