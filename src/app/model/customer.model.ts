export interface Customer {
    id: number,
    address: string,
    contactNumber: string,
    email?: string,
    name: string,
    image?: string | File,
}

export interface CustomerCountAndTopStat {
    totalCustomer:number,
    customer?: Customer,
    totalSpent:number,
    totalOrders:number,
}