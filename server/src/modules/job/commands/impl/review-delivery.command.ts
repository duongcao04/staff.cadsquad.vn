export class ReviewDeliveryCommand {
    constructor(
        public readonly adminId: string,
        public readonly deliveryId: string,
        public readonly isApproved: boolean,
        public readonly feedback?: string,
    ) { }
}