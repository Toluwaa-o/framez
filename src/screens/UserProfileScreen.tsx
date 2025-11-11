import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Post, UserProfile } from '../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const imageSize = width / 3 - 1;

interface UserProfileScreenProps {
    route: {
        params: {
            userId: string;
        };
    };
    navigation: any;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ route, navigation }) => {
    const { userId } = route.params;
    const { user } = useAuth();
    const { theme } = useTheme();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();

                const followersSnap = await getDocs(
                    query(collection(db, 'follows'), where('followingId', '==', userId))
                );
                const followingSnap = await getDocs(
                    query(collection(db, 'follows'), where('followerId', '==', userId))
                );

                setProfile({
                    uid: userId,
                    displayName: userData.displayName,
                    email: userData.email,
                    photoURL: userData.photoURL,
                    bio: userData.bio,
                    followersCount: followersSnap.size,
                    followingCount: followingSnap.size,
                    postsCount: 0,
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadUserPosts = () => {
        const q = query(
            collection(db, 'posts'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userPosts: Post[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
                likes: doc.data().likes || [],
                likeCount: doc.data().likes?.length || 0,
            } as Post));

            setPosts(userPosts);
            setProfile(prev => prev ? { ...prev, postsCount: userPosts.length } : null);
            setLoading(false);
        });

        return () => unsubscribe();
    };

    const checkFollowStatus = async () => {
        if (!user) return;
        try {
            const followDoc = await getDoc(doc(db, 'follows', `${user.uid}_${userId}`));
            setIsFollowing(followDoc.exists());
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollowToggle = async () => {
        if (!user) return;

        try {
            const followId = `${user.uid}_${userId}`;
            if (isFollowing) {
                await deleteDoc(doc(db, 'follows', followId));
                setIsFollowing(false);
                if (profile) {
                    setProfile({ ...profile, followersCount: profile.followersCount - 1 });
                }
            } else {
                await setDoc(doc(db, 'follows', followId), {
                    followerId: user.uid,
                    followingId: userId,
                    timestamp: new Date(),
                });
                setIsFollowing(true);
                if (profile) {
                    setProfile({ ...profile, followersCount: profile.followersCount + 1 });
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    useEffect(() => {
        loadUserProfile();
        const unsubscribe = loadUserPosts();
        checkFollowStatus();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId]);

    const renderPost = ({ item }: { item: Post }) => (
        <TouchableOpacity style={styles.gridItem}>
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
            ) : (
                <View
                    style={[
                        styles.gridImage,
                        styles.gridImagePlaceholder,
                        { backgroundColor: theme.surfaceSecondary },
                    ]}
                >
                    <Text style={[styles.gridImageText, { color: theme.text }]} numberOfLines={3}>
                        {item.text}
                    </Text>
                </View>
            )}
            {item.likeCount > 0 && (
                <View style={styles.likeOverlay}>
                    <Ionicons name="heart" size={16} color="#fff" />
                    <Text style={styles.likeCount}>{item.likeCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (!profile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{profile.displayName}</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={[styles.profileSection, { borderBottomColor: theme.border }]}>
                <View style={styles.profileHeader}>
                    {profile.photoURL ? (
                        <Image source={{ uri: profile.photoURL }} style={styles.profileImage} />
                    ) : (
                        <View
                            style={[styles.profileImage, styles.profileImagePlaceholder, { backgroundColor: theme.primary }]}
                        >
                            <Text style={styles.profileImageText}>
                                {profile.displayName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                            <Text style={[styles.statNumber, { color: theme.text }]}>{posts.length ? posts.length : profile.postsCount}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Posts</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={[styles.statNumber, { color: theme.text }]}>{profile.followersCount}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={[styles.statNumber, { color: theme.text }]}>{profile.followingCount}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Following</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bioSection}>
                    <Text style={[styles.displayName, { color: theme.text }]}>{profile.displayName}</Text>
                    <Text style={[styles.email, { color: theme.textSecondary }]}>{profile.email}</Text>
                    {profile.bio && (
                        <Text style={[styles.bio, { color: theme.text }]}>{profile.bio}</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowing
                            ? { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }
                            : { backgroundColor: theme.primary },
                    ]}
                    onPress={handleFollowToggle}
                >
                    <Text
                        style={[
                            styles.followButtonText,
                            { color: isFollowing ? theme.text : '#fff' },
                        ]}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
                <View style={[styles.tab, styles.tabActive, { borderBottomColor: theme.text }]}>
                    <Ionicons name="grid" size={24} color={theme.text} />
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading posts...</Text>
                </View>
            ) : posts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="camera-outline" size={80} color={theme.border} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>No Posts Yet</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.grid}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    profileSection: {
        padding: 16,
        borderBottomWidth: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImage: {
        width: 86,
        height: 86,
        borderRadius: 43,
        marginRight: 24,
    },
    profileImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '600',
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 13,
        marginTop: 2,
    },
    bioSection: {
        marginBottom: 12,
    },
    displayName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        marginBottom: 4,
    },
    bio: {
        fontSize: 14,
        marginTop: 4,
    },
    followButton: {
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    followButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    tabActive: {
        borderBottomWidth: 2,
    },
    grid: {
        paddingTop: 1,
    },
    gridItem: {
        width: imageSize,
        height: imageSize,
        margin: 0.5,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    gridImageText: {
        fontSize: 12,
        textAlign: 'center',
    },
    likeOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    likeCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 20,
    },
});