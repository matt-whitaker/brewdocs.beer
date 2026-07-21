import { forwardRef} from "react";

const DrawerInput = forwardRef<HTMLInputElement>((_props, ref) => {
    return <input ref={ref} id="drawer" type="checkbox" className="drawer-toggle" />;
});
DrawerInput.displayName = "DrawerInput";
export default DrawerInput;