const chains = new Map<string, Promise<unknown>>();

export default function serialize<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = chains.get(key) ?? Promise.resolve();
    const result = previous.then(task, task);
    const settled = result.then(() => undefined, () => undefined);

    chains.set(key, settled);
    void settled.then(() => {
        if (chains.get(key) === settled) chains.delete(key);
    });

    return result;
}
