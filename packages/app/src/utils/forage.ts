
export const extractItems = async (forage: LocalForage) => {
    let items = [];
    await forage.iterate((val) => {
        items.push(val);
    });
    return items;
}