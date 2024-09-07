
export interface ChecklistData {
    name: string;
    items: {
        name: string;
        checked: boolean;
    }[];
}