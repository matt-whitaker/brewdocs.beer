
export default interface ShoppingList {
    name: string;
    items: {
        name: string;
        cost: string;
        weight?: string;
        purchased: boolean;
    }[];
}