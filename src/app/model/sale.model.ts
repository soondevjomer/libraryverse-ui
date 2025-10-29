export interface LibrarianSale {
    id:number,
    orderDate:string,
    customerName:string,
    saleItems?: SaleItem[],
    subtotal: number,
    orderStatus:string
}

export interface SaleItem {
    bookTitle: string,
    quantity:number,
    pricePerItem:number,
    total:number
}

export interface SaleStat {
    totalRevenue:number,
    totalPurchases:number,
    topBook:string,
    topAuthor:string,
    topGenre:string
}