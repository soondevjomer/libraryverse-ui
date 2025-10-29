export interface Cart {
    cartId?: number,
    bookId: number,
    bookName: string,
    price: number,
    quantity: number,
    maxQuantity: number
}

export interface MyCart {
    libraryId: number,
    libraryName: string,
    carts?: Cart[]
}