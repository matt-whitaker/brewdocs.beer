import classNames from "classnames";
import type { Metadata } from "next";
import Shell from "@/component/shell";
import {AppProps} from "next/app";
import {Urbanist} from "next/font/google";
import "../tailwind.css";

const urbanist = Urbanist({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "BrewDocs - An offline web app for brew day",
};

export default function App({ Component, pageProps }: AppProps) {
  return (
      <Shell className={classNames(urbanist.className, "overscroll-none")}>
          <Component {...pageProps } />
      </Shell>
  );
}
