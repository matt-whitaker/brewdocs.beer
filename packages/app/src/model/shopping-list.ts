
export default interface ShoppingList {
    name: string;
    items: {
        name: string;
        cost: string;
        scalar?: string;
        purchased: boolean;
    }[];
}