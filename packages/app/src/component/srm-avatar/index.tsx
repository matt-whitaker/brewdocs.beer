import {SRM_TO_HEX} from "@/component/srm-avatar/constants";
import {useMemo} from "react";
import classNames from "classnames";

export interface SrmAvatarProps {
    srm: number;
}

function findHexClasses(srm: number) {
    const match = Array.from(SRM_TO_HEX.entries()).find(([key, hex]) => srm <= key);

    if (match) {
        return match[1];
    }

    return SRM_TO_HEX.get(40) as [string, string, string];
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