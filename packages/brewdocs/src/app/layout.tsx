import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./tailwind.css";

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
    <html lang="en">
      <body className={urbanist.className}>
        {children}
      </body>
    </html>
  );
}
