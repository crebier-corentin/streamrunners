export enum ChatRank {
    Member,
    VIP,
    Diamond,
    Partner,
    Moderator,
    Admin
}

export interface SerializedUser {
    name: string;
    chatRank: ChatRank;
}
