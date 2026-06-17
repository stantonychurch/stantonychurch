import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import { Colors, Spacing, Radius } from '../config/theme';

import { useAuth } from '../context/AuthContext';

export default function SocialBar({ mediaType, mediaId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Record view when component mounts
    api.post('/social/view', { media_type: mediaType, media_id: mediaId }).catch(()=>{});
    loadSocial();
  }, [mediaId]);

  const loadSocial = async () => {
    try {
      const [lRes, cRes] = await Promise.all([
        api.get(`/social/likes/${mediaType}/${mediaId}`),
        api.get(`/social/comments/${mediaType}/${mediaId}`)
      ]);
      setLikes(lRes.data.count);
      setHasLiked(lRes.data.hasLiked);
      setComments(cRes.data);
    } catch (e) {
      console.log('Error loading social stats', e);
    }
  };

  const handleLike = async () => {
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    try {
      await api.post('/social/like', { media_type: mediaType, media_id: mediaId });
      loadSocial();
    } catch (e) {
      setHasLiked(hasLiked);
      setLikes(prev => hasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing ${mediaType} from St Antony Church app!`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post('/social/comment', { media_type: mediaType, media_id: mediaId, text: newComment });
      setNewComment('');
      loadSocial();
    } catch (e) {
      console.log('Failed to post comment', e);
    }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/social/comment/${id}`);
      loadSocial();
    } catch (e) {
      console.log('Failed to delete comment', e);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Text style={[styles.icon, hasLiked && {color: 'red'}]}>{hasLiked ? '❤️' : '🤍'}</Text>
          <Text style={styles.label}>{likes} Likes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.label}>{comments.length} Comments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Text style={styles.icon}>↗️</Text>
          <Text style={styles.label}>Share</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={comments}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <View style={styles.commentItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.commentName}>{item.member_name}</Text>
                    <Text style={styles.commentText}>{item.comment_text}</Text>
                  </View>
                  {isAdmin && (
                    <TouchableOpacity onPress={() => deleteComment(item.id)} style={{padding: 5}}>
                      <Text style={{color: Colors.error, fontSize: 12}}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              contentContainerStyle={{padding: 15}}
              ListEmptyComponent={<Text style={styles.emptyText}>No comments yet. Be the first!</Text>}
            />
            
            <View style={styles.inputArea}>
              <TextInput 
                style={styles.input} 
                placeholder="Write a comment..." 
                placeholderTextColor={Colors.textMuted}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity style={styles.postBtn} onPress={postComment}>
                <Text style={styles.postBtnText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  icon: {
    fontSize: 20
  },
  label: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  modalTitle: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '700'
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.textMuted
  },
  commentItem: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  commentName: {
    color: Colors.gold,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 3
  },
  commentText: {
    color: Colors.text,
    fontSize: 14,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    backgroundColor: Colors.dark2
  },
  input: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    color: Colors.text,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder
  },
  postBtn: {
    justifyContent: 'center',
    paddingHorizontal: 15
  },
  postBtnText: {
    color: Colors.gold,
    fontWeight: '700',
    fontSize: 16
  }
});
