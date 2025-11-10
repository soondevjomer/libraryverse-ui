export interface SearchBy {
    page?: number;
    size?: number;
    genre?: string;
    search?: string;
    sort?: string;
}

export enum SortBy {
    CREATED_DATE = "Date Added",
    TITLE = "Title",
    NAME = "Name",
    POPULAR = "Popularity",
    SOLD = "Sold",
    PRICE = "Price",
    STOCK = "Stock",
}

export enum SortDirection {
    ASC = "Ascending",
    DESC = "Descending",
}

export interface SearchFilter {
    search?: string,
    page?: number,
    sortBy?: string,
    sortDirection?: string,
    libraryId?: number,
}