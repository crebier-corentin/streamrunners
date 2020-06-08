/**
 * Subscription level. [[None]] is regular members and have no advantages.
 */
export enum SubscriptionLevel {
    None = 'none',
    VIP = 'vip',
    Diamond = 'diamond',
}

/**
 * Possible subscription types.
 */
export type SubscriptionType = Exclude<SubscriptionLevel, SubscriptionLevel.None>;

/**
 * @returns The name of the subscription level in french.
 */
export function SubscriptionLevelToFrench(lvl: SubscriptionLevel): string {
    switch (lvl) {
        case SubscriptionLevel.None:
            return 'Membre';
        case SubscriptionLevel.VIP:
            return 'V.I.P.';
        case SubscriptionLevel.Diamond:
            return 'Diamant';
    }
}
