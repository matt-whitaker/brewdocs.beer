import type {Metadata} from "next";
import {Urbanist} from "next/font/google";
import "./tailwind.css";
import Shell from "@/component/shell";

const urbanist = Urbanist({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Announcing: BrewDocs!",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" data-theme="nord">
        <body className={urbanist.className}>
        <Shell>
            {children}
        </Shell>
        </body>
        </html>
    );
}
