import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithOptionalClass} from "@/component/prop-types";

type TypographyProps = PropsWithChildren & PropsWithOptionalClass;

export const ScreenH1 = ({ children, className }: TypographyProps) =>
    (<h1 className={classNames("text-4xl capitalize mt-5 [&+h2]:mt-0", [className])}>{children}</h1>);

export const ScreenH2 = ({ children, className }: TypographyProps) =>
    (<h2 className={classNames("text-3xl capitalize mt-5 [&+h3]:mt-0", [className])}>{children}</h2>);

export const ScreenH3 = ({ children, className }: TypographyProps) =>
    (<h3 className={classNames("text-2xl capitalize mt-3 [&+h4]:mt-0", [className])}>{children}</h3>);

export const ScreenH4 = ({ children, className }: TypographyProps) =>
    (<h4 className={classNames("text-lg capitalize mt-2 [&+h5]:mt-0", [className])}>{children}</h4>);

export const ScreenP = ({ children, className}: TypographyProps) =>
    (<p className={classNames("mt-1 [&+p]:mt-0 first-of-type:mt-0", [className])}>{children}</p>);

export const ScreenHr = ({ children, className }: TypographyProps) =>
    (<div className={classNames("sm:divider max-sm:divider-neutral my-5 [&+*]:mt-0", [className])}>{children}</div>);