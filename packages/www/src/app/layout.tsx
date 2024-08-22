import type {Metadata} from "next";
import {Urbanist} from "next/font/google";
import "./tailwind.css";
import Shell from "@/component/shell";
import classNames from "classnames";
import {Viewport} from "next";

const urbanist = Urbanist({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Announcing: BrewDocs!",
};

export const viewport: Viewport = {
    initialScale: 1,
    width: "device-width",
    maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" data-theme="nord">
        <body className={classNames(urbanist.className, "w-screen overscroll-none")}>
        <Shell>
            {children}
        </Shell>
        </body>
        </html>
    );
}
