import {PropsWithChildren} from "react";
import Drawer from "@/component/drawer";
import DrawerContent from "@/component/drawer/content";
import DrawerInput from "@/component/drawer/input";
import DrawerSidebar from "@/component/drawer/sidebar";
import useDrawer from "@/hooks/useDrawer";
import nav from "@/data/nav";

export type ShellProps = PropsWithChildren;

export default function Shell({ children }: ShellProps) {
    const [ref, close] = useDrawer();
    return (
        <Drawer>
            <DrawerInput ref={ref} />
            <DrawerContent>{children}</DrawerContent>
            <DrawerSidebar close={close} nav={nav} />
        </Drawer>
    );
}