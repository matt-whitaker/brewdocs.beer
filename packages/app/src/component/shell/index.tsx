"use client";

import {PropsWithChildren, useCallback, useRef} from "react";
import nav from "@/data/nav";
import DrawerInput from "@/component/drawer/input";
import DrawerContent from "@/component/drawer/content";
import DrawerSidebar from "@/component/drawer/sidebar";
import Drawer from "@/component/drawer";
import useDrawer from "@/component/drawer/useDrawer";

export type ShellProps = PropsWithChildren;

export default function Shell({ children }: ShellProps) {
    const [ref, close] = useDrawer();
    return (
        <Drawer>
            <DrawerInput ref={ref} />
            <DrawerContent>{children}</DrawerContent>
            <DrawerSidebar close={close} nav={nav} />
        </Drawer>
    )
}