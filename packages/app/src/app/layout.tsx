import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./tailwind.css";
import classNames from "classnames";

const urbanist = Urbanist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BrewDocs - An offline web app for brew day",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="nord">
      <body className={classNames(urbanist.className, "overscroll-none")}>
        {children}
      </body>
    </html>
  );
}
