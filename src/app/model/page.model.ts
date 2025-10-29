export interface Page<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElement: number;
    totalPage: number
}