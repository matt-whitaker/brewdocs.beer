export default (name) => (message) => {
    const error = new Error(message);
    Object.assign(error, { name });
    return error;
}