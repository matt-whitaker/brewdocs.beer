import {forwardRef} from "react";

export default forwardRef((_, ref) => {
    return <input ref={ref} id="drawer" type="checkbox" className="drawer-toggle" />;
})