export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
}

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    text: string;
    imageUrl?: string;
    timestamp: Date;
    likes: string[];
    likeCount: number;
}

export interface Follow {
    followerId: string;
    followingId: string;
    timestamp: Date;
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
}

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type MainTabParamList = {
    Feed: undefined;
    Search: undefined;
    CreatePost: undefined;
    Profile: undefined;
};