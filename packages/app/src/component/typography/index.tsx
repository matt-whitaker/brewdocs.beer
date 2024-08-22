import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

type TypographyProps = PropsWithChildren & Partial<PropsWithClass>;

export const ScreenH1 = ({ children, className }: TypographyProps) =>
    (<h1 className={classNames("text-4xl capitalize mt-5 [&+h2]:mt-0", [className])}>{children}</h1>);

export const ScreenH2 = ({ children, className }: TypographyProps) =>
    (<h2 className={classNames("text-3xl capitalize mt-5 [&+h3]:mt-0", [className])}>{children}</h2>);

export const ScreenH3 = ({ children, className }: TypographyProps) =>
    (<h3 className={classNames("text-2xl capitalize mt-3 [&+h4]:mt-0", [className])}>{children}</h3>);

export const ScreenH4 = ({ children, className }: TypographyProps) =>
    (<h4 className={classNames("text-lg capitalize mt-2 [&+h5]:mt-0 [&+h4]:mt-0", [className])}>{children}</h4>);

export const ScreenH5 = ({ children, className }: TypographyProps) =>
    (<h5 className={classNames("capitalize mt-1", [className])}>{children}</h5>);

export const ScreenP = ({ children, className}: TypographyProps) =>
    (<p className={classNames("mt-1 [&+p]:mt-0 first-of-type:mt-0", [className])}>{children}</p>);