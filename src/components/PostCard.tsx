import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Post } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { theme } = useTheme();

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7) {
      return date.toLocaleDateString();
    } else if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes > 0 ? `${diffInMinutes}m ago` : 'Just now';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {post.userPhoto ? (
            <Image source={{ uri: post.userPhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{post.userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.userName, { color: theme.text }]}>{post.userName}</Text>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>{formatTimestamp(post.timestamp)}</Text>
          </View>
        </View>
      </View>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.content}>
        <View style={styles.actions}>
          <Ionicons name="heart-outline" size={28} color={theme.text} style={styles.actionIcon} />
          <Ionicons name="chatbubble-outline" size={26} color={theme.text} style={styles.actionIcon} />
          <Ionicons name="paper-plane-outline" size={26} color={theme.text} />
        </View>

        {post.text && (
          <View style={styles.captionContainer}>
            <Text style={[styles.caption, { color: theme.text }]}>
              <Text style={[styles.userName, { color: theme.text }]}>{post.userName}</Text> {post.text}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 12,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionIcon: {
    marginRight: 16,
  },
  captionContainer: {
    marginTop: 4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
});