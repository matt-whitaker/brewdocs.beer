
export default function error(name) {
    const constructor = (message) => {
        const err = new Error(message);
        err.name = name;
        return err;
    };

    constructor.name = name;
    return constructor;
}