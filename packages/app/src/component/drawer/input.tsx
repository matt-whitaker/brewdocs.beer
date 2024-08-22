import {forwardRef} from "react";

const DrawerInput = forwardRef((_, ref) => {
    return <input ref={ref} id="drawer" type="checkbox" className="drawer-toggle" />;
});
DrawerInput.displayName = "DrawerInput";
export default DrawerInput;