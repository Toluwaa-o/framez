import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const CreatePostScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { theme } = useTheme();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImageToCloudinary = async (uri: string): Promise<string> => {
        const data = new FormData();

        data.append("file", {
            uri,
            type: "image/jpeg",
            name: `post_${Date.now()}.jpg`,
        } as any);

        data.append("upload_preset", "unsigned_posts");
        data.append("folder", "posts");

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_FIREBASE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );

        const json = await res.json();

        if (!json.secure_url) {
            throw new Error("Cloudinary upload failed");
        }

        return json.secure_url;
    };


    const handlePost = async () => {
        if (!text.trim() && !image) {
            Alert.alert('Error', 'Please add some content or an image');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = undefined;
            if (image) {
                imageUrl = await uploadImageToCloudinary(image);
            }

            await addDoc(collection(db, 'posts'), {
                userId: user?.uid,
                userName: user?.displayName,
                userPhoto: user?.photoURL ?? null,
                text: text.trim(),
                imageUrl,
                timestamp: serverTimestamp(),
                likes: 0,
            });

            setText('');
            setImage(null);
            Alert.alert('Success', 'Post created successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Feed') }
            ]);
        } catch (error: any) {
            console.error('Post creation error:', error);
            let errorMessage = 'Failed to create post. ';

            if (error.code === 'storage/unauthorized') {
                errorMessage += 'Please check your Firebase Storage rules.';
            } else if (error.message.includes('CORS')) {
                errorMessage += 'Please test on a mobile device or emulator instead of web browser.';
            } else {
                errorMessage += error.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={32} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>New Post</Text>
                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={loading || (!text.trim() && !image)}
                    >
                        <Text
                            style={[
                                styles.postButton,
                                { color: theme.primary },
                                loading || (!text.trim() && !image) ? styles.postButtonDisabled : null,
                            ]}
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.userInfo}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                                <Text style={styles.avatarText}>
                                    {user?.displayName?.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <Text style={[styles.userName, { color: theme.text }]}>{user?.displayName}</Text>
                    </View>

                    <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={theme.textSecondary}
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={500}
                    />

                    {image && (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: image }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => setImage(null)}
                            >
                                <Ionicons name="close-circle" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.addImageButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                        onPress={pickImage}
                    >
                        <Ionicons name="images" size={24} color={theme.primary} />
                        <Text style={[styles.addImageText, { color: theme.primary }]}>
                            {image ? 'Change Image' : 'Add Image'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.charCount, { color: theme.textSecondary }]}>{text.length}/500</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    postButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    postButtonDisabled: {
        opacity: 0.4,
    },
    content: {
        padding: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    textInput: {
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    addImageText: {
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        marginTop: 8,
    },
});