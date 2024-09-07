import { forwardRef} from "react";

const DrawerInput = forwardRef((props, ref: any) => {
    return <input ref={ref} id="drawer" type="checkbox" className="drawer-toggle" />;
});
DrawerInput.displayName = "DrawerInput";
export default DrawerInput;