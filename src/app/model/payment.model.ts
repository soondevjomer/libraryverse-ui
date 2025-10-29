export enum PaymentMethod {
    COD = "Cash On Delivery",
    DIGITAL_WALLET = "Digital Wallet",
    BANK_TRANSFER = "Bank"
}

export interface PaymentRequest {
    amount: number,
    paymentMethod: string,
    accountNumber?:string,
    walletId?:string,
}

export interface PaymentResponse {
status: boolean,
    message: string
}

export interface PaymentResponse {
    status: boolean,
    message: string
}

export interface PaymentBank {
    accountNumber: string,
    bankName: string
}

export interface PaymentWallet {
    mobileNumber: string,
    accountName: string
}