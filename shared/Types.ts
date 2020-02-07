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

export interface SerializedChatMessage {
    id: number;
    author: SerializedUser;
    message: string;
    deleted: boolean;
    createdAt: string;
}
