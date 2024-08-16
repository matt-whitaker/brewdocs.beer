import {PropsWithChildren} from "react";
import classNames from "classnames";

type OptionalClassNameProps = { className?: string }
type TypographyProps = PropsWithChildren & OptionalClassNameProps;

export const ScreenH1 = ({ children, className }: TypographyProps) =>
    (<h1 className={classNames([className], "text-4xl capitalize mt-5 [&+h2]:mt-0")}>{children}</h1>);

export const ScreenH2 = ({ children, className }: TypographyProps) =>
    (<h2 className={classNames([className], "text-3xl capitalize mt-5 [&+h3]:mt-0")}>{children}</h2>);

export const ScreenH3 = ({ children, className }: TypographyProps) =>
    (<h3 className={classNames([className], "text-2xl capitalize mt-3 [&+h4]:mt-0")}>{children}</h3>);

export const ScreenH4 = ({ children, className }: TypographyProps) =>
    (<h4 className={classNames([className], "text-lg capitalize mt-2 [&+h5]:mt-0")}>{children}</h4>);

export const ScreenP = ({ children, className}: TypographyProps) =>
    (<p className={classNames("mt-1 [&+p]:mt-0 first-of-type:mt-0", [className])}>{children}</p>);

export const ScreenHr = ({ children, className }: TypographyProps) =>
    (<div className={classNames("sm:divider my-5 [&+*]:mt-0", [className])}>{children}</div>);