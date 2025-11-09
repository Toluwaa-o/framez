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
    likes?: number;
}

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type MainTabParamList = {
    Feed: undefined;
    CreatePost: undefined;
    Profile: undefined;
};