
export interface BatchChecklist {
    name: string;
    items: {
        name: string;
        checked: boolean;
    }[];
}