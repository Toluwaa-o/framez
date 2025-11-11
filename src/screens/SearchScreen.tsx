import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface SearchUser {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export const SearchScreen: React.FC = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<SearchUser[]>([]);
    const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAllUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = allUsers.filter(
                (u) =>
                    u.uid !== user?.uid &&
                    (u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setUsers(filtered);
        } else {
            setUsers(allUsers.filter((u) => u.uid !== user?.uid));
        }
    }, [searchQuery, allUsers, user]);

    const loadAllUsers = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const usersData = snapshot.docs.map((doc) => ({
                uid: doc.id,
                ...doc.data(),
            })) as SearchUser[];
            setAllUsers(usersData);
            setUsers(usersData.filter((u) => u.uid !== user?.uid));
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserPress = (selectedUser: SearchUser) => {
        navigation.navigate('UserProfile' as never, { userId: selectedUser.uid } as never);
    };

    const renderUser = ({ item }: { item: SearchUser }) => (
        <TouchableOpacity
            style={[styles.userItem, { borderBottomColor: theme.border }]}
            onPress={() => handleUserPress(item)}
        >
            {item.photoURL ? (
                <Image source={{ uri: item.photoURL }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
                </View>
            )}
            <View style={styles.userInfo}>
                <Text style={[styles.displayName, { color: theme.text }]}>{item.displayName}</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>{item.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Search</Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.surfaceSecondary }]}>
                <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search users..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading users...</Text>
                </View>
            ) : users.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="person-outline" size={80} color={theme.border} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>
                        {searchQuery ? 'No users found' : 'No users to show'}
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        {searchQuery ? 'Try a different search' : 'Start by searching for users'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.uid}
                    renderItem={renderUser}
                    showsVerticalScrollIndicator={false}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
    },
    displayName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    email: {
        fontSize: 14,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 16,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});