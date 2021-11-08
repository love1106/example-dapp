export class TransactionEvent {
    event: TransactionEventType;
    data: any
}

export enum TransactionEventType {
    transactionHash = "transactionHash",
    receipt = "receipt",
    confirmation = "confirmation",
    error = "error"
}