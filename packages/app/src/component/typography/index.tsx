import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

type TypographyProps = PropsWithChildren & Partial<PropsWithClass>;

export const ScreenH1 = ({ children, className }: TypographyProps) =>
    (<h1 className={classNames("text-2xl capitalize -mx-2 px-2 py-1 mt-5 first:mt-0 [&+h2]:mt-0 bg-primary bg-opacity-60 rounded-badge", [className])}>{children}</h1>);

export const ScreenH2 = ({ children, className }: TypographyProps) =>
    (<h2 className={classNames("text-2xl capitalize mt-5 first:mt-0 [&+h3]:mt-0", [className])}>{children}</h2>);

export const ScreenH3 = ({ children, className }: TypographyProps) =>
    (<h3 className={classNames("text-xl capitalize mt-3 first:mt-0 [&+h4]:mt-1 leading-tight", [className])}>{children}</h3>);

export const ScreenH4 = ({ children, className }: TypographyProps) =>
    (<h4 className={classNames("text-md uppercase mt-2 first:mt-0 [&+h5]:mt-0 [&+h4]:mt-0 leading-tight", [className])}>{children}</h4>);

export const ScreenH5 = ({ children, className }: TypographyProps) =>
    (<h5 className={classNames("capitalize mt-1 first:mt-0", [className])}>{children}</h5>);

export const ScreenP = ({ children, className}: TypographyProps) =>
    (<p className={classNames("mt-1 [&+p]:mt-0 first-of-type:mt-0", [className])}>{children}</p>);