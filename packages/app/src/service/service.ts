
export interface Service<T> {
    get(id: string): T;
}