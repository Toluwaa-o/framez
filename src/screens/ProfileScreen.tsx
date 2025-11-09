import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Post } from '../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const imageSize = width / 3 - 1;

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'posts'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userPosts: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      } as Post));

      setPosts(userPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    setShowThemeMenu(false);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.gridItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      ) : (
        <View style={[styles.gridImage, styles.gridImagePlaceholder, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.gridImageText, { color: theme.text }]} numberOfLines={3}>
            {item.text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{user?.displayName}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setShowThemeMenu(!showThemeMenu)} style={styles.iconButton}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={26} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showThemeMenu && (
        <View style={[styles.themeMenu, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => handleThemeChange('light')}
          >
            <Ionicons name="sunny" size={22} color={theme.text} />
            <Text style={[styles.themeOptionText, { color: theme.text }]}>Light</Text>
            {themeMode === 'light' && <Ionicons name="checkmark" size={22} color={theme.primary} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => handleThemeChange('dark')}
          >
            <Ionicons name="moon" size={22} color={theme.text} />
            <Text style={[styles.themeOptionText, { color: theme.text }]}>Dark</Text>
            {themeMode === 'dark' && <Ionicons name="checkmark" size={22} color={theme.primary} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => handleThemeChange('system')}
          >
            <Ionicons name="phone-portrait-outline" size={22} color={theme.text} />
            <Text style={[styles.themeOptionText, { color: theme.text }]}>System</Text>
            {themeMode === 'system' && <Ionicons name="checkmark" size={22} color={theme.primary} />}
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.profileSection, { borderBottomColor: theme.border }]}>
        <View style={styles.profileHeader}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.profileImageText}>
                {user?.displayName?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{posts.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioSection}>
          <Text style={[styles.displayName, { color: theme.text }]}>{user?.displayName}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>
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
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Start sharing your moments!</Text>
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
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  themeMenu: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeOptionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
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
    marginTop: 8,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
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
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});