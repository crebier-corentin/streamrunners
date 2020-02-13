export interface TwitchUser {
    broadcaster_type: 'partner' | 'affiliate' | '';
    description: string;
    display_name: string;
    email?: string;
    id: string;
    login: string;
    offline_image_url: string;
    profile_image_url: string;
    type: 'staff' | 'admin' | 'global_mod' | '';
    view_count: number;
}

export interface TwitchResponse<T> {
    data: T[];
}
