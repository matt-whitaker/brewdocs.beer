import type {Metadata} from "next";
import {Urbanist} from "next/font/google";
import "./tailwind.css";
import Shell from "@/component/shell";
import classNames from "classnames";

const urbanist = Urbanist({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Announcing: BrewDocs!",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" data-theme="nord">
        <body className={classNames(urbanist.className, "max-w-screen")}>
        <Shell>
            {children}
        </Shell>
        </body>
        </html>
    );
}
