export interface BookDetail {
    id: number,
    title: string,
    seriesTitle: string,
    description: string,
    genres?: string[],
    authors?: string[],
    tags?: string[],
    publisher?: string,
    publishedYear?: number,
    price: number,
    bookCover?: string | File,
    bookThumbnailCover?: string | File,
}

export interface Book {
    id: number,
    isbn: string,
    libraryId: number,
    bookDetail: BookDetail,
    inventory?: Inventory,
    popularityScore: number,
    roundedRating: number,
}

export interface Inventory {
    id: number,
    availableStock: number,
    reservedStock: number,
    shipped: number,
    delivered: number,
}