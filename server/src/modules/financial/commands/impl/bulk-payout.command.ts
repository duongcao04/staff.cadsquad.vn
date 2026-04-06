export class BulkPayoutCommand {
    constructor(
        public readonly userId: string,
        public readonly jobIds: string[],
        public readonly paymentChannelId?: string,
    ) {}
}