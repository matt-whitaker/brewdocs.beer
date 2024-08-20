"use client";

import {PropsWithChildren, useCallback, useRef} from "react";
import nav from "@/data/nav";
import DrawerInput from "@/component/drawer/input";
import DrawerContent from "@/component/drawer/content";
import DrawerSidebar from "@/component/drawer/sidebar";
import Drawer from "@/component/drawer";

export type ShellProps = PropsWithChildren;

export default function Shell({ children }: ShellProps) {
    const ref = useRef<HTMLInputElement>();
    const closeDrawer = useCallback(() => ref.current.checked = false, [ref]);
    return (
        <Drawer>
            <DrawerInput ref={ref} />
            <DrawerContent>{children}</DrawerContent>
            <DrawerSidebar close={closeDrawer} nav={nav} />
        </Drawer>
    )
}