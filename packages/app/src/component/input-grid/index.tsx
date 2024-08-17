import TitleCell from "@/component/input-grid/title-cell";
import Cell from "@/component/input-grid/cell";
import Row from "@/component/input-grid/row";
import List from "@/component/input-grid/list";
import {PropsWithChildren} from "react";

export type InputGridProps<T> = Partial<PropsWithChildren> & {
    // grid: [[string, string, string?, string?], { readonly?: boolean, renamable?: boolean }?][];
    rows: T[];
    attrs: (keyof T)[];
    titleAttr: keyof T;
    readonlyAttrs?: (keyof T)[];
    titleEditable: boolean;
}

export default function InputGrid<T>({ children, rows, attrs, titleAttr, readonlyAttrs = [], titleEditable = false }: InputGridProps<T>) {

    return (
        <List>
            {rows.map((row) => (
                <Row>
                    <TitleCell value={row[titleAttr]} onChange={titleEditable ? () => {} : void 0} />
                    {attrs.map((attr, i) => (
                        <Cell readonly={readonlyAttrs?.includes(attr)} value={row[attr]} col={i+1+(3-attrs.length)} />
                    ))}
                </Row>
            ))}
            {children ? children : <></>}
        </List>
    )
}

export { TitleCell };