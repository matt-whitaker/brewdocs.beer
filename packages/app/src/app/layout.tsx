import type {Metadata} from "next";
import {Urbanist} from "next/font/google";
import classNames from "classnames";
import Shell from "@/component/shell";
import {PropsWithChildren} from "react";

import "../tailwind.css";

const urbanist = Urbanist({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "BrewDocs - An offline web app for brew day",
};

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en" data-theme="nord">
        <body className={classNames(urbanist.className, "overscroll-none max-w-screen")}>
        <Shell>
            {children}
        </Shell>
        </body>
        </html>
    );
}
