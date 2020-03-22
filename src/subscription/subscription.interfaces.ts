export enum SubscriptionLevel {
    None = 'none',
    VIP = 'vip',
    Diamond = 'diamond',
}

export type SubscriptionType = Exclude<SubscriptionLevel, SubscriptionLevel.None>;

export function SubscriptionLevelToFrench(lvl: SubscriptionLevel): string {
    switch (lvl) {
        case SubscriptionLevel.None:
            return 'Membre';
        case SubscriptionLevel.VIP:
            return 'V.I.P.';
        case SubscriptionLevel.Diamond:
            return 'Diamand';
    }
}
