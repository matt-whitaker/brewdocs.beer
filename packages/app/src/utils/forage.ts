
export const extractItems = async (forage: LocalForage) => {
    let items: any[] = [];
    await forage.iterate((val) => {
        items.push(val);
    });
    return items;
}