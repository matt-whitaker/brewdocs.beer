export type PropsWithClass = { className?: string; };
export type PropsWithOnClick = { onClick?: () => void; };
export type PropsWithOnChange<T> = { onChange?: (value: T) => void; };
export type PropsWithOnBlur<T> = { onBlur?: (value: T) => void; };