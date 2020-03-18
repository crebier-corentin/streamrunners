export enum SubscriptionLevel {
    None = 'none',
    VIP = 'vip',
    Diamond = 'diamond',
}

export enum SubscriptionStatus {
    Active = 'active',
    Queued = 'queued',
    CancelledActive = 'cancelled_active', //Cancelled but not expired
    Cancelled = 'cancelled',
}
