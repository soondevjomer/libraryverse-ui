import { PaymentMethod } from './payment.model';
export interface OrderRequest {
    address?:string,
    contactNumber?:string,
    paymentMethod?: keyof typeof PaymentMethod,
    orderItems?: OrderItem[]
}

export interface OrderItem {
    bookId: number,
    bookName: string,
    quantity: number,
    price: number
}

export interface OrderResponse {
    orderId: number,
    orderDate: string,
    paymentMethod: string,
    totalAmount: number,
    storeOrders?: StoreOrder[]
}

export interface StoreOrderSummary {
    storeOrderId: number,
    libraryName: string,
    subtotal: number,
    status: string
}

export enum OrderStatus {
    PENDING = "Pending",
    SHIPPED = "Shipped",
    DELIVERED = "Delivered",
    CANCELLED = "Cancelled"
}

export interface StoreOrder {
    id: number,
    orderItems?: OrderItem[] | [],
    subtotal: number
    orderStatus: keyof typeof OrderStatus
}

export interface OrderStat {
    totalDelivered:number,
    totalPending:number,
    totalShipped:number,
}