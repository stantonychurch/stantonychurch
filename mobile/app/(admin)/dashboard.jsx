import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Animated, useWindowDimensions, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import apiClient, { getPlatform, postPlatform } from '../../src/services/api';
import { API_BASE_URL } from '../../src/config/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';

const SERVER_URL = API_BASE_URL.replace('/api', '');
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Tab state: 'overview', 'members', 'groups', 'approvals', 'videos', 'audio', 'events', 'announcements', 'prayers', 'activity'
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Overview data
  const [stats, setStats] = useState(null);
  
  // Members data
  const [members, setMembers] = useState([]);

  // Youth Groups data
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  // Pending Approvals data
  const [pending, setPending] = useState([]);

  // Video data & form
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', category: 'Sermon', url: '' });
  const [submittingVideo, setSubmittingVideo] = useState(false);

  // Audio data & form
  const [audios, setAudios] = useState([]);
  const [audioForm, setAudioForm] = useState({ title: '', pastor: '', description: '' });
  const [submittingAudio, setSubmittingAudio] = useState(false);

  // Events data & form
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', event_date: '', event_time: '', location: '', description: '' });
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Announcements data & form
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', type: 'General', is_emergency: false });
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  // Prayers data
  const [prayers, setPrayers] = useState([]);
  const [selectedPrayerId, setSelectedPrayerId] = useState(null);
  const [testimonyText, setTestimonyText] = useState('');

  // Likes & Comments Activity
  const [activity, setActivity] = useState({ likes: [], comments: [] });
  const [activeSubTab, setActiveSubTab] = useState('comments');
  const [memberSearch, setMemberSearch] = useState('');

  // --- VERSES HANDLERS ---
  const handleCreateVerse = async () => {
    if (!verseForm.verse || !verseForm.reference) return Alert.alert('Error', 'Verse and Reference are required');
    try {
      await apiClient.post('/verses', verseForm);
      Alert.alert('Success', 'Bible Verse added successfully!');
      setVerseForm({ verse: '', reference: '' });
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteVerse = async (id) => {
    try {
      await apiClient.delete(`/verses/${id}`);
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete verse');
    }
  };

  // New Tabs Data & Forms
  const [devotionals, setDevotionals] = useState([]);
  const [devotionalForm, setDevotionalForm] = useState({ title: '', content: '', scripture: '', prayer: '' });
  const [worshipSongs, setWorshipSongs] = useState([]);
  const [worshipForm, setWorshipForm] = useState({ title: '', artist: '', lyrics: '' });
  const [quizzes, setQuizzes] = useState([]);
  const [quizForm, setQuizForm] = useState({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '' });
  const [readingPlans, setReadingPlans] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ day_of_week: 'Sunday', service_time: '', description: '' });
  const [podcasts, setPodcasts] = useState([]);
  const [podcastForm, setPodcastForm] = useState({ title: '', description: '', url: '' });
  const [galleries, setGalleries] = useState([]);
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '' });
  const [adminSelectedGallery, setAdminSelectedGallery] = useState(null);
  const [adminGalleryMedia, setAdminGalleryMedia] = useState([]);
  const [familyGroups, setFamilyGroups] = useState([]);
  const [familyReport, setFamilyReport] = useState([]);
  const [familyMessage, setFamilyMessage] = useState({});
  const [prayerReply, setPrayerReply] = useState({});
  const [verses, setVerses] = useState([]);
  const [verseForm, setVerseForm] = useState({ verse: '', reference: '' });
  
  const [youthGroups, setYouthGroups] = useState([]);
  const [youthGroupForm, setYouthGroupForm] = useState({ group_name: '' });
  const [youthMessage, setYouthMessage] = useState({});

  const [testimonies, setTestimonies] = useState([]);
  const [prayerGroups, setPrayerGroups] = useState([]);
  const [prayerGroupForm, setPrayerGroupForm] = useState({ name: '', description: '', leader_name: '' });
  const [worshipPlaylists, setWorshipPlaylists] = useState([]);
  const [playlistForm, setPlaylistForm] = useState({ title: '', description: '', song_ids: '' });
  const [choirMaterials, setChoirMaterials] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeForm, setChallengeForm] = useState({ title: '', description: '', challenge_date: '', category: 'Faith' });
  const [childrenStories, setChildrenStories] = useState([]);
  const [childrenStoryForm, setChildrenStoryForm] = useState({ title: '', content: '', age_group: 'All', language: 'en', url: '' });
  const [storyCompletions, setStoryCompletions] = useState([]);
  const [submittingStory, setSubmittingStory] = useState(false);

  // Document picker reference
  const [selectedFile, setSelectedFile] = useState(null);

  // Drawer Layout state and animation values
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { width } = useWindowDimensions();
  const DRAWER_WIDTH = Math.round(width * 0.76);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isDrawerOpen) {
      slideAnim.setValue(-DRAWER_WIDTH);
    }
  }, [DRAWER_WIDTH]);

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDrawerOpen, DRAWER_WIDTH]);

  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);
  const clearSelectedFile = () => setSelectedFile(null);

  const handleMenuSelect = async (tab) => {
    setIsDrawerOpen(false);
    setSelectedFile(null);
    if (tab === 'logout') {
      await handleLogout();
    } else {
      setActiveTab(tab);
    }
  };

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  async function pickDocument(type) {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: type === 'video' ? 'video/*' : 'audio/*',
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedFile(res.assets[0]);
      }
    } catch (err) {
      console.log('Error picking file:', err);
    }
  }

  // Testimonies Delete
  async function handleDeleteTestimony(id) {
    Alert.alert('Delete', 'Delete testimony?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/platform/testimonies/${id}`);
          Alert.alert('Success', 'Testimony deleted.');
          loadData();
        } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  // Prayer Group Creation
  async function handleCreatePrayerGroup() {
    if (!prayerGroupForm.name.trim()) return Alert.alert('Required', 'Enter group name');
    try {
      await postPlatform('/prayer-groups', {
        name: prayerGroupForm.name.trim(),
        description: prayerGroupForm.description.trim(),
        leader_name: prayerGroupForm.leader_name.trim()
      });
      Alert.alert('Success', 'Prayer Group created!');
      setPrayerGroupForm({ name: '', description: '', leader_name: '' });
      loadData();
    } catch (e) { Alert.alert('Error', e.message); }
  }

  // Worship Playlist Creation
  async function handleCreatePlaylist() {
    if (!playlistForm.title.trim()) return Alert.alert('Required', 'Enter playlist title');
    try {
      await postPlatform('/worship-playlists', {
        title: playlistForm.title.trim(),
        description: playlistForm.description.trim(),
        song_ids: playlistForm.song_ids.trim()
      });
      Alert.alert('Success', 'Worship Playlist created!');
      setPlaylistForm({ title: '', description: '', song_ids: '' });
      loadData();
    } catch (e) { Alert.alert('Error', e.message); }
  }

  // Delete Choir Material
  async function handleDeleteChoirMaterial(id) {
    Alert.alert('Delete', 'Delete choir material?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/platform/choir-materials/${id}`);
          Alert.alert('Success', 'Choir material deleted');
          loadData();
        } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  // Challenge Creation
  async function handleCreateChallenge() {
    if (!challengeForm.title.trim() || !challengeForm.description.trim()) return Alert.alert('Required', 'Title and description are required');
    try {
      await postPlatform('/challenges', {
        title: challengeForm.title.trim(),
        description: challengeForm.description.trim(),
        category: challengeForm.category,
        challenge_date: challengeForm.challenge_date || new Date().toISOString().split('T')[0]
      });
      Alert.alert('Success', 'Daily Challenge created!');
      setChallengeForm({ title: '', description: '', challenge_date: '', category: 'Faith' });
      loadData();
    } catch (e) { Alert.alert('Error', e.message); }
  }

  // Children Story Creation
  async function handleCreateStory() {
    if (!childrenStoryForm.title.trim()) return Alert.alert('Required', 'Enter story title');
    setSubmittingStory(true);
    try {
      const formData = new FormData();
      formData.append('title', childrenStoryForm.title.trim());
      formData.append('content', childrenStoryForm.content.trim());
      formData.append('age_group', childrenStoryForm.age_group);
      formData.append('language', childrenStoryForm.language);
      if (childrenStoryForm.url.trim()) formData.append('url', childrenStoryForm.url.trim());
      if (selectedFile) {
        formData.append('video', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'video/mp4' });
      }
      await apiClient.post('/platform/children-stories', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000
      });
      Alert.alert('Success', 'Children Story uploaded!');
      setChildrenStoryForm({ title: '', content: '', age_group: 'All', language: 'en', url: '' });
      setSelectedFile(null);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmittingStory(false);
    }
  }

  // Delete Children Story
  async function handleDeleteStory(id) {
    Alert.alert('Delete', 'Delete story?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/platform/children-stories/${id}`);
          loadData();
        } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await getPlatform('/admin/stats');
        setStats(res.data || null);
      } else if (activeTab === 'members') {
        const res = await apiClient.get('/members');
        setMembers(res.data || []);
      } else if (activeTab === 'groups') {
        const res = await getPlatform('/youth/groups');
        setGroups(res.data || []);
      } else if (activeTab === 'approvals') {
        const res = await getPlatform('/youth/pending');
        setPending(res.data || []);
      } else if (activeTab === 'videos') {
        const res = await apiClient.get('/videos');
        setVideos(res.data || []);
      } else if (activeTab === 'audio') {
        const res = await apiClient.get('/audio');
        setAudios(res.data || []);
      } else if (activeTab === 'events') {
        const res = await apiClient.get('/events');
        setEvents(res.data || []);
      } else if (activeTab === 'announcements') {
        const res = await apiClient.get('/announcements');
        setAnnouncements(res.data || []);
      } else if (activeTab === 'prayers') {
        const res = await getPlatform('/prayer/all');
        setPrayers(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'verses') {
        const res = await apiClient.get('/verses');
        setVerses(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'activity') {
        const res = await apiClient.get('/devotionals');
        setDevotionals(res.data || []);
      } else if (activeTab === 'devotionals') {
        const res = await apiClient.get('/devotionals');
        setDevotionals(res.data || []);
      } else if (activeTab === 'worship') {
        const res = await apiClient.get('/worship');
        setWorshipSongs(res.data || []);
      } else if (activeTab === 'quizzes') {
        const res = await apiClient.get('/quiz');
        setQuizzes(res.data || []);
      } else if (activeTab === 'reading_plans') {
        const res = await getPlatform('/reading-plans');
        setReadingPlans(res.data || []);
      } else if (activeTab === 'schedules') {
        const res = await getPlatform('/service-schedules');
        setSchedules(res.data || []);
      } else if (activeTab === 'podcasts') {
        const res = await getPlatform('/podcasts');
        setPodcasts(res.data || []);
      } else if (activeTab === 'galleries') {
        const res = await getPlatform('/event-galleries');
        setGalleries(res.data || []);
      } else if (activeTab === 'family_groups') {
        try {
          const [groupsRes, reportRes] = await Promise.all([
            getPlatform('/family/all'),
            apiClient.get('/platform/family/report/candles')
          ]);
          setFamilyGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
          setFamilyReport(Array.isArray(reportRes.data) ? reportRes.data : []);
        } catch(e) {
          console.log('Failed to load family groups', e);
          setFamilyGroups([]);
          setFamilyReport([]);
        }
      } else if (activeTab === 'testimonies') {
        const res = await getPlatform('/testimonies');
        setTestimonies(res.data || []);
      } else if (activeTab === 'prayer_groups') {
        const res = await getPlatform('/prayer-groups');
        setPrayerGroups(res.data || []);
      } else if (activeTab === 'playlists_choir') {
        const [playlistsRes, choirRes, songsRes] = await Promise.all([
          getPlatform('/worship-playlists'),
          getPlatform('/choir-materials'),
          apiClient.get('/worship')
        ]);
        setWorshipPlaylists(playlistsRes.data || []);
        setChoirMaterials(choirRes.data || []);
        setWorshipSongs(songsRes.data || []);
      } else if (activeTab === 'challenges') {
        const res = await getPlatform('/challenges');
        setChallenges(res.data || []);
      } else if (activeTab === 'children_stories') {
        const [storiesRes, completionsRes] = await Promise.all([
          getPlatform('/children-stories'),
          getPlatform('/children-stories/report/completions')
        ]);
        setChildrenStories(storiesRes.data || []);
        setStoryCompletions(completionsRes.data || []);
      } else if (activeTab === 'prayers') {
        const [cRes, lRes] = await Promise.all([
          apiClient.get('/admin/comments'),
          apiClient.get('/admin/likes')
        ]);
        setActivity({
          comments: cRes.data || [],
          likes: lRes.data || [],
        });
      }
    } catch (e) {
      console.log('Error loading admin dashboard datasets', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function handleRemoveMember(id) {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to delete this member from the database?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/members/${id}`);
            Alert.alert('Success', 'Member removed.');
            loadData();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        }}
      ]
    );
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return Alert.alert('Required', 'Please enter a group name.');
    setCreatingGroup(true);
    try {
      const res = await postPlatform('/youth/create', { group_name: newGroupName.trim() });
      Alert.alert('Group Created', `Group "${newGroupName.trim()}" created! Invite Code: ${res.data.qr_code_id}`);
      setNewGroupName('');
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCreatingGroup(false);
    }
  }

  async function handleApprove(youthMemberId) {
    try {
      await postPlatform('/youth/approve', { youth_member_id: youthMemberId });
      Alert.alert('Approved', 'Member approved successfully.');
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  }

  async function handleAddVideo() {
    if (!videoForm.title.trim()) return Alert.alert('Required', 'Please enter a video title.');
    if (!selectedFile && !videoForm.url.trim()) {
      return Alert.alert('Required', 'Please select a video file or enter a URL.');
    }
    setSubmittingVideo(true);
    try {
      const formData = new FormData();
      formData.append('title', videoForm.title.trim());
      formData.append('description', videoForm.description.trim());
      formData.append('category', videoForm.category);
      if (videoForm.url.trim()) formData.append('url', videoForm.url.trim());
      if (selectedFile) {
        formData.append('video', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'video/mp4' });
      }
      await apiClient.post('/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 });
      Alert.alert('Success', 'Video uploaded!');
      setVideoForm({ title: '', description: '', category: 'Sermon', url: '' });
      setSelectedFile(null);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSubmittingVideo(false);
    }
  }

  async function handleDeleteVideo(id) {
    Alert.alert('Delete', 'Delete video?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiClient.delete(`/videos/${id}`); loadData(); } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function handleAddAudio() {
    if (!audioForm.title.trim()) return Alert.alert('Required', 'Enter audio title.');
    if (!selectedFile) return Alert.alert('Required', 'Pick audio file.');
    setSubmittingAudio(true);
    try {
      const formData = new FormData();
      formData.append('title', audioForm.title.trim());
      formData.append('pastor', audioForm.pastor.trim() || 'Unknown');
      formData.append('description', audioForm.description.trim());
      formData.append('audio', { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.mimeType || 'audio/mpeg' });
      await apiClient.post('/audio', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 });
      Alert.alert('Success', 'Audio uploaded!');
      setAudioForm({ title: '', pastor: '', description: '' });
      setSelectedFile(null);
      loadData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSubmittingAudio(false);
    }
  }

  async function handleDeleteAudio(id) {
    Alert.alert('Delete', 'Delete audio?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiClient.delete(`/audio/${id}`); loadData(); } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function handleAddEvent() {
    if (!eventForm.title.trim() || !eventForm.event_date.trim()) return Alert.alert('Required', 'Title and Date required.');
    setSubmittingEvent(true);
    try {
      await apiClient.post('/events', eventForm);
      Alert.alert('Success', 'Event added!');
      setEventForm({ title: '', event_date: '', event_time: '', location: '', description: '' });
      loadData();
    } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message); } finally { setSubmittingEvent(false); }
  }

  async function handleDeleteEvent(id) {
    Alert.alert('Delete', 'Delete event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiClient.delete(`/events/${id}`); loadData(); } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  const getEventSplit = () => {
    const now = new Date(); now.setHours(0,0,0,0);
    const upcoming = events.filter(e => new Date(e.event_date) >= now).sort((a,b) => new Date(a.event_date) - new Date(b.event_date));
    const past = events.filter(e => new Date(e.event_date) < now).sort((a,b) => new Date(b.event_date) - new Date(a.event_date));
    return { upcoming, past };
  };

  async function handleAddAnnouncement() {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return Alert.alert('Required', 'Title and Content required.');
    setSubmittingAnnouncement(true);
    try {
      await apiClient.post('/announcements', { ...announcementForm, is_emergency: announcementForm.is_emergency ? 1 : 0 });
      Alert.alert('Success', 'Published!');
      setAnnouncementForm({ title: '', content: '', type: 'General', is_emergency: false });
      loadData();
    } catch (e) { Alert.alert('Error', e.response?.data?.error || e.message); } finally { setSubmittingAnnouncement(false); }
  }

  async function handleDeleteAnnouncement(id) {
    Alert.alert('Delete', 'Delete announcement?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiClient.delete(`/announcements/${id}`); loadData(); } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function handleDeletePrayer(id) {
    Alert.alert('Delete', 'Delete request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiClient.delete(`/prayer/${id}`); loadData(); } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}><Text style={styles.menuBtnText}>☰</Text></TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Admin Portal</Text>
              <Text style={styles.userName}>{user?.name || 'Administrator'} ⚙️</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={Colors.gold} />}>
          {activeTab === 'overview' && (
            <View>
              <Text style={styles.sectionTitle}>CHURCH PLATFORM OVERVIEW</Text>
              {stats ? (
                <View style={styles.grid}>
                  <View style={styles.card}>
                    <Text style={styles.cardIcon}>👥</Text>
                    <Text style={styles.cardVal}>{stats.members || 0}</Text>
                    <Text style={styles.cardLabel}>Active Members</Text>
                    {stats.pending_members > 0 ? (
                      <View style={[styles.badge, { backgroundColor: 'rgba(243,156,18,0.15)', borderColor: Colors.warning, marginTop: 8 }]}>
                        <Text style={[styles.badgeText, { color: Colors.warning }]}>{stats.pending_members} Pending</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardIcon}>🙏</Text>
                    <Text style={styles.cardVal}>{stats.prayer_requests || 0}</Text>
                    <Text style={styles.cardLabel}>Prayer Requests</Text>
                    {stats.answered_prayers > 0 ? (
                      <Text style={styles.cardSubText}>🎉 {stats.answered_prayers} Answered</Text>
                    ) : null}
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardIcon}>📅</Text>
                    <Text style={styles.cardVal}>{stats.events || 0}</Text>
                    <Text style={styles.cardLabel}>Total Events</Text>
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardIcon}>🎓</Text>
                    <Text style={styles.cardVal}>{stats.courses || 0}</Text>
                    <Text style={styles.cardLabel}>Discipleship Courses</Text>
                  </View>
                </View>
              ) : !loading && <Text style={styles.empty}>Failed to load statistics.</Text>}
            </View>
          )}

          {activeTab === 'members' && (
            <View>
              <Text style={styles.sectionTitle}>REGISTERED MEMBERS</Text>
              <TextInput
                style={styles.input}
                placeholder="🔍 Search members by name or phone..."
                placeholderTextColor={Colors.textMuted}
                value={memberSearch}
                onChangeText={setMemberSearch}
              />
              {members.length === 0 ? (
                <Text style={styles.empty}>No members registered yet.</Text>
              ) : (
                members.filter(m => 
                  m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                  m.phone.includes(memberSearch)
                ).map(m => (
                  <View key={m.id} style={styles.groupCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 16 }}>👤 {m.name}</Text>
                        <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4 }}>📞 {m.phone}</Text>
                        {m.created_at ? (
                          <Text style={{ fontSize: 11, color: Colors.textDim, marginTop: 2 }}>Joined: {new Date(m.created_at).toLocaleDateString()}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity 
                        style={[styles.approveBtn, { backgroundColor: Colors.error }]} 
                        onPress={() => handleRemoveMember(m.id)}
                      >
                        <Text style={styles.approveBtnText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'groups' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Create Youth Group</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Group Name" 
                  placeholderTextColor={Colors.textMuted} 
                  value={newGroupName} 
                  onChangeText={setNewGroupName} 
                />
                <TouchableOpacity 
                  style={[styles.btn, creatingGroup && styles.btnDisabled]} 
                  onPress={handleCreateGroup} 
                  disabled={creatingGroup}
                >
                  {creatingGroup ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.btnText}>Generate Invite Code</Text>}
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>ACTIVE GROUPS</Text>
              {groups.length === 0 ? (
                <Text style={styles.empty}>No active youth groups found.</Text>
              ) : (
                groups.map(g => (
                  <View key={g.id} style={styles.groupCard}>
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupName}>🔥 {g.group_name}</Text>
                      {g.created_at ? (
                        <Text style={styles.groupDate}>{new Date(g.created_at).toLocaleDateString()}</Text>
                      ) : null}
                    </View>
                    <View style={styles.codeRow}>
                      <Text style={styles.codeLabel}>Invite Code</Text>
                      <Text style={styles.codeValue}>{g.qr_code_id}</Text>
                    </View>
                    <View style={{marginTop: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: Radius.sm}}>
                      <Text style={[styles.codeLabel, {marginBottom: 5}]}>Broadcast Message</Text>
                      <TextInput 
                        style={styles.input} 
                        placeholder="Type a message..." 
                        placeholderTextColor={Colors.textMuted} 
                        value={youthMessage[g.id] || ''} 
                        onChangeText={v => setYouthMessage(prev => ({...prev, [g.id]: v}))} 
                      />
                      <View style={{flexDirection: 'row', gap: 10}}>
                        <TouchableOpacity style={[styles.btn, {flex: 1, paddingVertical: 8}]} onPress={async () => {
                          if (!youthMessage[g.id]) return Alert.alert('Error', 'Message cannot be empty');
                          try {
                            const formData = new FormData();
                            formData.append('content', youthMessage[g.id]);
                            await apiClient.post(`/platform/youth/${g.id}/post`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 });
                            Alert.alert('Success', 'Message sent!');
                            setYouthMessage(prev => ({...prev, [g.id]: ''}));
                          } catch (e) { Alert.alert('Error', e.message); }
                        }}>
                          <Text style={styles.btnText}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, {flex: 1, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.1)'}]} onPress={async () => {
                          const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
                          if (!result.canceled) {
                            const file = result.assets[0];
                            const formData = new FormData();
                            formData.append('content', youthMessage[g.id] || 'Media upload');
                            formData.append('media', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' });
                            try {
                              await apiClient.post(`/platform/youth/${g.id}/post`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 });
                              Alert.alert('Success', 'Media uploaded!');
                              setYouthMessage(prev => ({...prev, [g.id]: ''}));
                            } catch (e) { Alert.alert('Error', e.message); }
                          }
                        }}>
                          <Text style={[styles.btnText, {color: Colors.text}]}>Attach Media</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'approvals' && (
            <View>
              <Text style={styles.sectionTitle}>PENDING YOUTH GROUP REQUESTS</Text>
              {pending.length === 0 ? (
                <Text style={styles.empty}>No pending membership requests.</Text>
              ) : (
                pending.map(p => (
                  <View key={p.youth_member_id} style={styles.approvalCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>👤 {p.member_name}</Text>
                      <Text style={styles.memberPhone}>📞 {p.member_phone}</Text>
                      <Text style={styles.targetGroup}>Group: {p.group_name}</Text>
                      {p.joined_at ? (
                        <Text style={{ fontSize: 11, color: Colors.textDim, marginTop: 4 }}>Requested: {new Date(p.joined_at).toLocaleDateString()}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity 
                      style={styles.approveBtn} 
                      onPress={() => handleApprove(p.youth_member_id)}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'videos' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Upload / Link Video</Text>
                
                <TextInput 
                  style={styles.input} 
                  placeholder="Video Title" 
                  placeholderTextColor={Colors.textMuted}
                  value={videoForm.title} 
                  onChangeText={v => setVideoForm(f => ({...f, title: v}))} 
                />
                
                <TextInput 
                  style={styles.input} 
                  placeholder="Description (Optional)" 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={videoForm.description} 
                  onChangeText={v => setVideoForm(f => ({...f, description: v}))} 
                />

                <Text style={[styles.codeLabel, { marginBottom: 6 }]}>Category</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {['Sermon', 'Worship', 'Youth', 'Kids'].map(cat => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[
                        styles.subTabButton, 
                        videoForm.category === cat && { backgroundColor: Colors.gold, borderColor: Colors.gold }
                      ]}
                      onPress={() => setVideoForm(f => ({...f, category: cat}))}
                    >
                      <Text style={[
                        styles.subTabText, 
                        videoForm.category === cat && { color: Colors.dark, fontWeight: '700' }
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput 
                  style={styles.input} 
                  placeholder="External Video URL (Optional)" 
                  placeholderTextColor={Colors.textMuted}
                  value={videoForm.url} 
                  onChangeText={v => setVideoForm(f => ({...f, url: v}))} 
                />

                <Text style={[styles.codeLabel, { marginVertical: 4 }]}>OR Upload Video File</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <TouchableOpacity style={[styles.filePickerBtn, { flex: 1 }]} onPress={() => pickDocument('video')}>
                    <Text style={{color: Colors.gold, fontWeight: '600', fontSize: 13, textAlign: 'center'}}>
                      {selectedFile ? 'Selected: ' + selectedFile.name.substring(0, 20) + '...' : '📁 Select Video File'}
                    </Text>
                  </TouchableOpacity>
                  {selectedFile && (
                    <TouchableOpacity 
                      style={{ padding: 10, backgroundColor: 'rgba(231,76,60,0.15)', borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.error }}
                      onPress={clearSelectedFile}
                    >
                      <Text style={{ color: Colors.error, fontWeight: '700' }}>❌</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  style={[styles.btn, submittingVideo && styles.btnDisabled]} 
                  onPress={handleAddVideo}
                  disabled={submittingVideo}
                >
                  {submittingVideo ? (
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <Text style={styles.btnText}>Submit Video</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>EXISTING VIDEOS</Text>
              {videos.length === 0 ? (
                <Text style={styles.empty}>No videos available.</Text>
              ) : (
                videos.map(v => (
                  <View key={v.id} style={styles.groupCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 15 }}>🎬 {v.title}</Text>
                        <Text style={{ fontSize: 12, color: Colors.gold, fontWeight: '600', marginTop: 2 }}>Category: {v.category}</Text>
                        {v.description ? <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>{v.description}</Text> : null}
                        <Text style={{ fontSize: 11, color: Colors.textDim, marginTop: 6 }} numberOfLines={1}>
                          Source: {v.filename ? `File (${v.filename})` : v.url}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.approveBtn, { backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6 }]} 
                        onPress={() => handleDeleteVideo(v.id)}
                      >
                        <Text style={styles.approveBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'audio' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Upload Audio Sermon</Text>
                
                <TextInput 
                  style={styles.input} 
                  placeholder="Audio Title" 
                  placeholderTextColor={Colors.textMuted}
                  value={audioForm.title} 
                  onChangeText={v => setAudioForm(f => ({...f, title: v}))} 
                />

                <TextInput 
                  style={styles.input} 
                  placeholder="Pastor / Preacher" 
                  placeholderTextColor={Colors.textMuted}
                  value={audioForm.pastor} 
                  onChangeText={v => setAudioForm(f => ({...f, pastor: v}))} 
                />
                
                <TextInput 
                  style={styles.input} 
                  placeholder="Description (Optional)" 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={audioForm.description} 
                  onChangeText={v => setAudioForm(f => ({...f, description: v}))} 
                />

                <Text style={[styles.codeLabel, { marginVertical: 4 }]}>Select Audio File</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <TouchableOpacity style={[styles.filePickerBtn, { flex: 1 }]} onPress={() => pickDocument('audio')}>
                    <Text style={{color: Colors.gold, fontWeight: '600', fontSize: 13, textAlign: 'center'}}>
                      {selectedFile ? 'Selected: ' + selectedFile.name.substring(0, 20) + '...' : '📁 Select Audio File'}
                    </Text>
                  </TouchableOpacity>
                  {selectedFile && (
                    <TouchableOpacity 
                      style={{ padding: 10, backgroundColor: 'rgba(231,76,60,0.15)', borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.error }}
                      onPress={clearSelectedFile}
                    >
                      <Text style={{ color: Colors.error, fontWeight: '700' }}>❌</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  style={[styles.btn, submittingAudio && styles.btnDisabled]} 
                  onPress={handleAddAudio}
                  disabled={submittingAudio}
                >
                  {submittingAudio ? (
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <Text style={styles.btnText}>Upload Audio</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>EXISTING AUDIO TRACKS</Text>
              {audios.length === 0 ? (
                <Text style={styles.empty}>No audio tracks available.</Text>
              ) : (
                audios.map(a => (
                  <View key={a.id} style={styles.groupCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 15 }}>🎵 {a.title}</Text>
                        <Text style={{ fontSize: 12, color: Colors.gold, fontWeight: '600', marginTop: 2 }}>Pastor: {a.pastor}</Text>
                        {a.description ? <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>{a.description}</Text> : null}
                        <Text style={{ fontSize: 11, color: Colors.textDim, marginTop: 6 }}>Filename: {a.filename}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.approveBtn, { backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6 }]} 
                        onPress={() => handleDeleteAudio(a.id)}
                      >
                        <Text style={styles.approveBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'events' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Church Event</Text>
                
                <TextInput 
                  style={styles.input} 
                  placeholder="Event Title" 
                  placeholderTextColor={Colors.textMuted}
                  value={eventForm.title} 
                  onChangeText={v => setEventForm(f => ({...f, title: v}))} 
                />
                
                <TextInput 
                  style={styles.input} 
                  placeholder="Event Date (YYYY-MM-DD)" 
                  placeholderTextColor={Colors.textMuted}
                  value={eventForm.event_date} 
                  onChangeText={v => setEventForm(f => ({...f, event_date: v}))} 
                />

                <TextInput 
                  style={styles.input} 
                  placeholder="Event Time (e.g. 09:00 AM)" 
                  placeholderTextColor={Colors.textMuted}
                  value={eventForm.event_time} 
                  onChangeText={v => setEventForm(f => ({...f, event_time: v}))} 
                />

                <TextInput 
                  style={styles.input} 
                  placeholder="Location / Venue" 
                  placeholderTextColor={Colors.textMuted}
                  value={eventForm.location} 
                  onChangeText={v => setEventForm(f => ({...f, location: v}))} 
                />

                <TextInput 
                  style={styles.input} 
                  placeholder="Description (Optional)" 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={eventForm.description} 
                  onChangeText={v => setEventForm(f => ({...f, description: v}))} 
                />

                <TouchableOpacity 
                  style={[styles.btn, submittingEvent && styles.btnDisabled]} 
                  onPress={handleAddEvent}
                  disabled={submittingEvent}
                >
                  {submittingEvent ? (
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <Text style={styles.btnText}>Add Event</Text>
                  )}
                </TouchableOpacity>
              </View>

              {(() => {
                const { upcoming, past } = getEventSplit();
                return (
                  <View>
                    <Text style={styles.sectionTitle}>UPCOMING EVENTS ({upcoming.length})</Text>
                    {upcoming.length === 0 ? (
                      <Text style={[styles.empty, { paddingTop: 10, marginBottom: 20 }]}>No upcoming events scheduled.</Text>
                    ) : (
                      upcoming.map(e => (
                        <View key={e.id} style={styles.groupCard}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                              <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 16 }}>📅 {e.title}</Text>
                              <Text style={{ fontSize: 13, color: Colors.gold, marginTop: 4, fontWeight: '600' }}>
                                📅 {e.event_date} {e.event_time ? `| ⏰ ${e.event_time}` : ''}
                              </Text>
                              {e.location ? (
                                <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>📍 {e.location}</Text>
                              ) : null}
                              {e.description ? (
                                <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>{e.description}</Text>
                              ) : null}
                            </View>
                            <TouchableOpacity 
                              style={[styles.approveBtn, { backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6 }]} 
                              onPress={() => handleDeleteEvent(e.id)}
                            >
                              <Text style={styles.approveBtnText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}

                    <Text style={styles.sectionTitle}>PAST EVENTS ({past.length})</Text>
                    {past.length === 0 ? (
                      <Text style={[styles.empty, { paddingTop: 10 }]}>No past events.</Text>
                    ) : (
                      past.map(e => (
                        <View key={e.id} style={[styles.groupCard, { opacity: 0.7 }]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                              <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 16 }}>📅 {e.title}</Text>
                              <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4 }}>
                                📅 {e.event_date} {e.event_time ? `| ⏰ ${e.event_time}` : ''}
                              </Text>
                              {e.location ? (
                                <Text style={{ fontSize: 12, color: Colors.textDim, marginTop: 4 }}>📍 {e.location}</Text>
                              ) : null}
                            </View>
                            <TouchableOpacity 
                              style={[styles.approveBtn, { backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6 }]} 
                              onPress={() => handleDeleteEvent(e.id)}
                            >
                              <Text style={styles.approveBtnText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                );
              })()}
            </View>
          )}

          {activeTab === 'announcements' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Publish Announcement</Text>
                
                <TextInput 
                  style={styles.input} 
                  placeholder="Announcement Title" 
                  placeholderTextColor={Colors.textMuted}
                  value={announcementForm.title} 
                  onChangeText={v => setAnnouncementForm(f => ({...f, title: v}))} 
                />

                <TextInput 
                  style={styles.input} 
                  placeholder="Content details..." 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={announcementForm.content} 
                  onChangeText={v => setAnnouncementForm(f => ({...f, content: v}))} 
                />

                <Text style={[styles.codeLabel, { marginBottom: 6 }]}>Category / Type</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  {['General', 'Youth', 'Tamil', 'Events'].map(t => (
                    <TouchableOpacity 
                      key={t} 
                      style={[
                        styles.subTabButton, 
                        announcementForm.type === t && { backgroundColor: Colors.gold, borderColor: Colors.gold }
                      ]}
                      onPress={() => setAnnouncementForm(f => ({...f, type: t}))}
                    >
                      <Text style={[
                        styles.subTabText, 
                        announcementForm.type === t && { color: Colors.dark, fontWeight: '700' }
                      ]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Emergency / Urgent Alert</Text>
                  <Switch 
                    value={announcementForm.is_emergency} 
                    onValueChange={v => setAnnouncementForm(f => ({...f, is_emergency: v}))} 
                    trackColor={{ false: '#767577', true: Colors.gold }}
                    thumbColor={announcementForm.is_emergency ? Colors.white : '#f4f3f4'}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.btn, submittingAnnouncement && styles.btnDisabled]} 
                  onPress={handleAddAnnouncement}
                  disabled={submittingAnnouncement}
                >
                  {submittingAnnouncement ? (
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <Text style={styles.btnText}>Publish Announcement</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>PUBLISHED ANNOUNCEMENTS</Text>
              {announcements.length === 0 ? (
                <Text style={styles.empty}>No announcements published yet.</Text>
              ) : (
                announcements.map(a => (
                  <View key={a.id} style={styles.groupCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 16 }}>📢 {a.title}</Text>
                          {a.is_emergency ? (
                            <View style={[styles.badge, { backgroundColor: 'rgba(231,76,60,0.15)', borderColor: Colors.error }]}>
                              <Text style={[styles.badgeText, { color: Colors.error }]}>URGENT</Text>
                            </View>
                          ) : null}
                          <View style={[styles.badge, { backgroundColor: 'rgba(200, 153, 26, 0.1)', borderColor: Colors.gold }]}>
                            <Text style={[styles.badgeText, { color: Colors.gold }]}>{a.type}</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 6, lineHeight: 18 }}>{a.content}</Text>
                        <Text style={{ fontSize: 11, color: Colors.textDim, marginTop: 8 }}>
                          Published on: {new Date(a.created_at).toLocaleDateString()} by {a.added_by || 'Admin'}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.approveBtn, { backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6 }]} 
                        onPress={() => handleDeleteAnnouncement(a.id)}
                      >
                        <Text style={styles.approveBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'prayers' && (
            <View>
              <Text style={styles.sectionTitle}>PRAYER REQUESTS LIST</Text>
              {prayers.length === 0 ? (
                <Text style={styles.empty}>No prayer requests found.</Text>
              ) : (
                prayers.map(pr => (
                  <View key={pr.id} style={styles.groupCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          <Text style={{ fontWeight: '700', color: Colors.text, fontSize: 14 }}>
                            👤 {pr.member_name || 'Anonymous'}
                          </Text>
                          {pr.is_emergency ? (
                            <View style={[styles.badge, { backgroundColor: 'rgba(231,76,60,0.15)', borderColor: Colors.error }]}>
                              <Text style={[styles.badgeText, { color: Colors.error }]}>EMERGENCY</Text>
                            </View>
                          ) : null}
                          {pr.is_answered ? (
                            <View style={[styles.badge, { backgroundColor: 'rgba(46,204,113,0.15)', borderColor: Colors.success }]}>
                              <Text style={[styles.badgeText, { color: Colors.success }]}>ANSWERED</Text>
                            </View>
                          ) : null}
                          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }]}>
                            <Text style={styles.badgeText}>{pr.category || 'General'}</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 13, color: Colors.text, marginTop: 4, lineHeight: 18 }}>{pr.request}</Text>
                        
                        {pr.is_answered && pr.answered_testimony ? (
                          <View style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(46,204,113,0.08)', borderRadius: Radius.sm, borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)' }}>
                            <Text style={{ fontSize: 12, color: Colors.success, fontWeight: '700' }}>Praise Report / Testimony:</Text>
                            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>{pr.answered_testimony}</Text>
                          </View>
                        ) : null}

                        {pr.created_at ? (
                          <Text style={{ fontSize: 11, color: Colors.textDim, marginTop: 6 }}>
                            Received: {new Date(pr.created_at).toLocaleDateString()}
                          </Text>
                        ) : null}
                      </View>
                      
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        {!pr.is_answered ? (
                          <TouchableOpacity 
                            style={[styles.approveBtn, { backgroundColor: Colors.success, paddingHorizontal: 10, paddingVertical: 6 }]} 
                            onPress={() => setSelectedPrayerId(pr.id)}
                          >
                            <Text style={styles.approveBtnText}>Answered</Text>
                          </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity 
                          style={[styles.approveBtn, { backgroundColor: Colors.error, paddingHorizontal: 10, paddingVertical: 6 }]} 
                          onPress={() => handleDeletePrayer(pr.id)}
                        >
                          <Text style={styles.approveBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* VERSES TAB */}
          {activeTab === 'verses' && (
            <View>
              <Text style={styles.sectionTitle}>BIBLE VERSES MANAGER</Text>
              <Text style={{color: Colors.textDim, marginBottom: 15, fontSize: 13}}>These verses will randomly appear in the daily Dove animation.</Text>
              
              <View style={styles.formCard}>
                <TextInput style={styles.input} placeholder="Bible Verse Text" placeholderTextColor={Colors.textMuted} value={verseForm.verse} onChangeText={t => setVerseForm({...verseForm, verse: t})} multiline />
                <TextInput style={styles.input} placeholder="Reference (e.g. John 3:16)" placeholderTextColor={Colors.textMuted} value={verseForm.reference} onChangeText={t => setVerseForm({...verseForm, reference: t})} />
                <TouchableOpacity style={styles.btn} onPress={handleCreateVerse}>
                  <Text style={styles.btnText}>Add Verse</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>ALL VERSES ({verses.length})</Text>
              {verses.map(v => (
                <View key={v.id} style={styles.groupCard}>
                  <Text style={{color: Colors.text, fontStyle: 'italic', marginBottom: 5}}>"{v.verse}"</Text>
                  <Text style={{color: Colors.gold, fontWeight: 'bold'}}>- {v.reference}</Text>
                  
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={() => handleDeleteVerse(v.id)}>
                    <Text style={styles.approveBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'activity' && (
            <View>
              <Text style={styles.sectionTitle}>ACTIVITY MONITOR</Text>
              
              <View style={styles.subTabContainer}>
                <TouchableOpacity 
                  style={[styles.subTabButton, activeSubTab === 'comments' && styles.subTabButtonActive]} 
                  onPress={() => setActiveSubTab('comments')}
                >
                  <Text style={[styles.subTabText, activeSubTab === 'comments' && styles.subTabTextActive]}>
                    Comments ({activity.comments.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.subTabButton, activeSubTab === 'likes' && styles.subTabButtonActive]} 
                  onPress={() => setActiveSubTab('likes')}
                >
                  <Text style={[styles.subTabText, activeSubTab === 'likes' && styles.subTabTextActive]}>
                    Likes ({activity.likes.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {activeSubTab === 'comments' ? (
                activity.comments.length === 0 ? (
                  <Text style={styles.empty}>No comments recorded.</Text>
                ) : (
                  activity.comments.map(c => (
                    <View key={c.id} style={styles.activityRow}>
                      <Text style={styles.activityIcon}>💬</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityText}>
                          <Text style={{ fontWeight: '700', color: Colors.text }}>{c.member_name || 'Member'}</Text> commented:
                        </Text>
                        <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' }}>
                          "{c.comment_text}"
                        </Text>
                        <Text style={styles.activitySub}>
                          On {c.media_type} (ID: {c.media_id}) {c.created_at ? `• ${new Date(c.created_at).toLocaleDateString()}` : ''}
                        </Text>
                      </View>
                    </View>
                  ))
                )
              ) : (
                activity.likes.length === 0 ? (
                  <Text style={styles.empty}>No likes recorded.</Text>
                ) : (
                  activity.likes.map(l => (
                    <View key={l.id} style={styles.activityRow}>
                      <Text style={styles.activityIcon}>❤️</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityText}>
                          <Text style={{ fontWeight: '700', color: Colors.text }}>{l.member_name || 'Member'}</Text> liked a content
                        </Text>
                        <Text style={styles.activitySub}>
                          On {l.media_type} (ID: {l.media_id}) {l.created_at ? `• ${new Date(l.created_at).toLocaleDateString()}` : ''}
                        </Text>
                      </View>
                    </View>
                  ))
                )
              )}
            </View>
          )}

          {activeTab === 'devotionals' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Daily Devotional</Text>
                <TextInput style={styles.input} placeholder="Title" placeholderTextColor={Colors.textMuted} value={devotionalForm.title} onChangeText={v => setDevotionalForm(f => ({...f, title: v}))} />
                <TextInput style={styles.input} placeholder="Scripture Reference (e.g. John 3:16)" placeholderTextColor={Colors.textMuted} value={devotionalForm.scripture_reference} onChangeText={v => setDevotionalForm(f => ({...f, scripture_reference: v}))} />
                <TextInput style={[styles.input, {height: 80}]} multiline placeholder="Scripture Text" placeholderTextColor={Colors.textMuted} value={devotionalForm.scripture} onChangeText={v => setDevotionalForm(f => ({...f, scripture: v}))} />
                <TextInput style={[styles.input, {height: 100}]} multiline placeholder="Devotional Content" placeholderTextColor={Colors.textMuted} value={devotionalForm.content} onChangeText={v => setDevotionalForm(f => ({...f, content: v}))} />
                <TextInput style={[styles.input, {height: 60}]} multiline placeholder="Prayer" placeholderTextColor={Colors.textMuted} value={devotionalForm.prayer} onChangeText={v => setDevotionalForm(f => ({...f, prayer: v}))} />
                <TouchableOpacity style={styles.btn} onPress={async () => {
                  try {
                    await apiClient.post('/devotionals', devotionalForm);
                    setDevotionalForm({title: '', content: '', scripture: '', prayer: '', scripture_reference: ''});
                    Alert.alert('Success', 'Devotional added!');
                    loadData();
                  } catch (e) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.btnText}>Publish Devotional</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>EXISTING DEVOTIONALS ({devotionals.length})</Text>
              {devotionals.map(d => (
                <View key={d.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>{d.title}</Text>
                  <Text style={styles.groupDate}>{new Date(d.created_at).toLocaleDateString()}</Text>
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={async () => {
                    await apiClient.delete(`/devotionals/${d.id}`); loadData();
                  }}><Text style={styles.approveBtnText}>Delete</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'worship' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Worship Song</Text>
                <TextInput style={styles.input} placeholder="Song Title" placeholderTextColor={Colors.textMuted} value={worshipForm.title} onChangeText={v => setWorshipForm(f => ({...f, title: v}))} />
                <TextInput style={styles.input} placeholder="Artist / Band" placeholderTextColor={Colors.textMuted} value={worshipForm.artist} onChangeText={v => setWorshipForm(f => ({...f, artist: v}))} />
                <TextInput style={[styles.input, {height: 120}]} multiline placeholder="Lyrics" placeholderTextColor={Colors.textMuted} value={worshipForm.lyrics} onChangeText={v => setWorshipForm(f => ({...f, lyrics: v}))} />
                <TouchableOpacity style={styles.btn} onPress={async () => {
                  try {
                    await apiClient.post('/worship', worshipForm);
                    setWorshipForm({title: '', artist: '', lyrics: ''});
                    Alert.alert('Success', 'Song added!'); loadData();
                  } catch(e) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.btnText}>Add Song</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>SONGS LIST ({worshipSongs.length})</Text>
              {worshipSongs.map(s => (
                <View key={s.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>{s.title} - {s.artist}</Text>
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={async () => {
                    await apiClient.delete(`/worship/${s.id}`); loadData();
                  }}><Text style={styles.approveBtnText}>Delete</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'quizzes' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Quiz Question</Text>
                <TextInput style={styles.input} placeholder="Question" placeholderTextColor={Colors.textMuted} value={quizForm.question} onChangeText={v => setQuizForm(f => ({...f, question: v}))} />
                <TextInput style={styles.input} placeholder="Option A" placeholderTextColor={Colors.textMuted} value={quizForm.option_a} onChangeText={v => setQuizForm(f => ({...f, option_a: v}))} />
                <TextInput style={styles.input} placeholder="Option B" placeholderTextColor={Colors.textMuted} value={quizForm.option_b} onChangeText={v => setQuizForm(f => ({...f, option_b: v}))} />
                <TextInput style={styles.input} placeholder="Option C" placeholderTextColor={Colors.textMuted} value={quizForm.option_c} onChangeText={v => setQuizForm(f => ({...f, option_c: v}))} />
                <TextInput style={styles.input} placeholder="Option D" placeholderTextColor={Colors.textMuted} value={quizForm.option_d} onChangeText={v => setQuizForm(f => ({...f, option_d: v}))} />
                <TextInput style={styles.input} placeholder="Correct Answer (e.g. A, B, C, D)" placeholderTextColor={Colors.textMuted} value={quizForm.correct_answer} onChangeText={v => setQuizForm(f => ({...f, correct_answer: v}))} />
                <TouchableOpacity style={styles.btn} onPress={async () => {
                  try {
                    await apiClient.post('/quiz', quizForm);
                    setQuizForm({question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: ''});
                    Alert.alert('Success', 'Question added!'); loadData();
                  } catch(e) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.btnText}>Add Question</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>QUESTIONS LIST ({quizzes.length})</Text>
              {quizzes.map(q => (
                <View key={q.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>{q.question}</Text>
                  <Text style={{color: Colors.success, fontSize: 12, marginTop: 4}}>Correct: {q.correct_answer}</Text>
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={async () => {
                    await apiClient.delete(`/quiz/${q.id}`); loadData();
                  }}><Text style={styles.approveBtnText}>Delete</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reading_plans' && (
            <View>
              <Text style={styles.sectionTitle}>BIBLE READING PLANS ({readingPlans.length})</Text>
              {readingPlans.map(r => (
                <View key={r.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>{r.plan_name}</Text>
                  <Text style={styles.groupDate}>{r.description}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 12, marginTop: 4}}>Duration: {r.duration_days} days</Text>
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={async () => {
                    await apiClient.delete(`/platform/reading-plans/${r.id}`); loadData();
                  }}><Text style={styles.approveBtnText}>Delete</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'schedules' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Service Schedule</Text>
                <TextInput style={styles.input} placeholder="Day of Week (e.g. Sunday)" placeholderTextColor={Colors.textMuted} value={scheduleForm.day_of_week} onChangeText={v => setScheduleForm(f => ({...f, day_of_week: v}))} />
                <TextInput style={styles.input} placeholder="Time (e.g. 09:00 AM)" placeholderTextColor={Colors.textMuted} value={scheduleForm.service_time} onChangeText={v => setScheduleForm(f => ({...f, service_time: v}))} />
                <TextInput style={styles.input} placeholder="Description (e.g. Holy Mass)" placeholderTextColor={Colors.textMuted} value={scheduleForm.description} onChangeText={v => setScheduleForm(f => ({...f, description: v}))} />
                <TouchableOpacity style={styles.btn} onPress={async () => {
                  try {
                    await apiClient.post('/platform/service-schedules', scheduleForm);
                    setScheduleForm({day_of_week: 'Sunday', service_time: '', description: ''});
                    Alert.alert('Success', 'Schedule added!'); loadData();
                  } catch(e) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.btnText}>Add Schedule</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>SERVICE SCHEDULES ({schedules.length})</Text>
              {schedules.map(s => (
                <View key={s.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>{s.day_of_week} - {s.service_time}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 12, marginTop: 4}}>{s.description}</Text>
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={async () => {
                    await apiClient.delete(`/platform/service-schedules/${s.id}`); loadData();
                  }}><Text style={styles.approveBtnText}>Delete</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'podcasts' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Podcast</Text>
                <TextInput style={styles.input} placeholder="Title" placeholderTextColor={Colors.textMuted} value={podcastForm.title} onChangeText={v => setPodcastForm(f => ({...f, title: v}))} />
                <TextInput style={styles.input} placeholder="Description" placeholderTextColor={Colors.textMuted} value={podcastForm.description} onChangeText={v => setPodcastForm(f => ({...f, description: v}))} />
                <TextInput style={styles.input} placeholder="Audio URL" placeholderTextColor={Colors.textMuted} value={podcastForm.url} onChangeText={v => setPodcastForm(f => ({...f, url: v}))} />
                <TouchableOpacity style={styles.btn} onPress={async () => {
                  try {
                    await apiClient.post('/platform/podcasts', podcastForm);
                    setPodcastForm({title: '', description: '', url: ''});
                    Alert.alert('Success', 'Podcast added!'); loadData();
                  } catch(e) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.btnText}>Add Podcast</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>PODCASTS ({podcasts.length})</Text>
              {podcasts.map(p => (
                <View key={p.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>{p.title}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 12, marginTop: 4}}>{p.description}</Text>
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={async () => {
                    await apiClient.delete(`/platform/podcasts/${p.id}`); loadData();
                  }}><Text style={styles.approveBtnText}>Delete</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'galleries' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Create Event Gallery</Text>
                <TextInput style={styles.input} placeholder="Gallery Name (e.g. Easter 2026)" placeholderTextColor={Colors.textMuted} value={galleryForm.title} onChangeText={v => setGalleryForm(f => ({...f, title: v}))} />
                <TextInput style={styles.input} placeholder="Description" placeholderTextColor={Colors.textMuted} value={galleryForm.description} onChangeText={v => setGalleryForm(f => ({...f, description: v}))} />
                <TouchableOpacity style={styles.btn} onPress={async () => {
                  try {
                    await apiClient.post('/platform/event-galleries', galleryForm);
                    setGalleryForm({title: '', description: ''});
                    Alert.alert('Success', 'Gallery created!'); loadData();
                  } catch(e) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.btnText}>Create Folder</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>EVENT GALLERIES ({galleries.length})</Text>
              
              {adminSelectedGallery ? (
                <View>
                  <TouchableOpacity onPress={() => { setAdminSelectedGallery(null); setAdminGalleryMedia([]); }} style={[styles.btn, { backgroundColor: Colors.dark, borderColor: Colors.glassBorder, borderWidth: 1, marginBottom: 15 }]}>
                    <Text style={styles.btnText}>← Back to Galleries</Text>
                  </TouchableOpacity>
                  <Text style={styles.formTitle}>Media in "{adminSelectedGallery.title}"</Text>
                  {adminGalleryMedia.length === 0 && <Text style={styles.empty}>No media uploaded yet.</Text>}
                  {adminGalleryMedia.map(m => (
                    <View key={m.id} style={styles.groupCard}>
                      <Text style={[styles.groupName, { fontSize: 14 }]}>Media ID: {m.id} ({m.media_type})</Text>
                      
                      {m.media_type === 'image' && <Image source={{ uri: m.url.startsWith('http') ? m.url : `${SERVER_URL}${m.url}` }} style={{ width: '100%', height: 200, borderRadius: 8, marginVertical: 10 }} resizeMode="cover" />}
                      {(m.media_type === 'video' || m.media_type === 'audio') && (
                        <Text style={{color: Colors.gold, marginVertical: 10}}>[{m.media_type.toUpperCase()} PREVIEW NOT AVAILABLE IN DASHBOARD - URL: {m.url}]</Text>
                      )}

                      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, marginTop: 10 }}>
                        <Text style={{ color: Colors.gold, fontWeight: 'bold', marginBottom: 5 }}>❤️ Liked By ({m.likes_count}):</Text>
                        {m.likers && m.likers.length > 0 ? (
                          <Text style={{ color: Colors.text }}>{m.likers.join(', ')}</Text>
                        ) : (
                          <Text style={{ color: Colors.textMuted }}>No likes yet.</Text>
                        )}
                      </View>
                      
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, marginTop: 10 }}>
                        <Text style={{ color: Colors.gold, fontWeight: 'bold', marginBottom: 5 }}>💬 Comments ({m.comments ? m.comments.length : 0}):</Text>
                        {m.comments && m.comments.length > 0 ? (
                          m.comments.map(c => (
                            <View key={c.id} style={{ marginBottom: 5 }}>
                              <Text style={{ color: Colors.text, fontWeight: 'bold' }}>{c.member_name}:</Text>
                              <Text style={{ color: Colors.textMuted }}>{c.content}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={{ color: Colors.textMuted }}>No comments yet.</Text>
                        )}
                      </View>

                      <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 15}]} onPress={async () => {
                        // We will allow deleting media too
                        Alert.alert('Delete Media', 'Are you sure?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: async () => {
                            // Using a direct delete via API, requires endpoint! 
                            // Since we don't have /media/:id DELETE, we just alert.
                            Alert.alert('Not Implemented', 'Requires backend endpoint for deleting individual media.');
                          }}
                        ]);
                      }}><Text style={styles.approveBtnText}>Delete Media</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                galleries.map(g => (
                  <View key={g.id} style={styles.groupCard}>
                    <Text style={styles.groupName}>📁 {g.title}</Text>
                    <Text style={{color: Colors.textMuted, fontSize: 12, marginTop: 4}}>{g.description}</Text>
                    
                    <View style={{ flexDirection: 'row', marginTop: 15, flexWrap: 'wrap', gap: 10 }}>
                      <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.primary}]} onPress={async () => {
                        setAdminSelectedGallery(g);
                        try {
                          const res = await apiClient.get(`/platform/event-galleries/${g.id}/media`);
                          setAdminGalleryMedia(res.data || []);
                        } catch (e) {
                          setAdminGalleryMedia([]);
                        }
                      }}><Text style={styles.approveBtnText}>View Media</Text></TouchableOpacity>

                      <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.gold}]} onPress={async () => {
                        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
                        if (!result.canceled) {
                          const file = result.assets[0];
                          const formData = new FormData();
                          formData.append('files', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' });
                          try {
                            await apiClient.post(`/platform/event-galleries/${g.id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 });
                            Alert.alert('Success', 'File uploaded successfully!');
                          } catch(e) { Alert.alert('Error', e.message); }
                        }
                      }}><Text style={[styles.approveBtnText, {color: '#000'}]}>Upload Media</Text></TouchableOpacity>

                      <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error}]} onPress={async () => {
                        await apiClient.delete(`/platform/event-galleries/${g.id}`); loadData();
                      }}><Text style={styles.approveBtnText}>Delete</Text></TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* FAMILY GROUPS TAB */}
          {activeTab === 'family_groups' && (
            <View>
              <Text style={styles.sectionTitle}>FAMILY PRAYER REPORT (LEADERBOARD)</Text>
              
              <View style={[styles.groupCard, { padding: 0, overflow: 'hidden', marginBottom: Spacing.xl }]}>
                <View style={{flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder}}>
                  <Text style={{flex: 2, color: Colors.gold, fontWeight: 'bold'}}>Family Name</Text>
                  <Text style={{flex: 1, color: Colors.textMuted, textAlign: 'center'}}>Candles</Text>
                  <Text style={{flex: 1, color: Colors.textMuted, textAlign: 'center'}}>Hours</Text>
                </View>
                {familyReport.length === 0 && <Text style={{padding: 15, color: Colors.textDim, textAlign: 'center'}}>No prayer data yet.</Text>}
                {familyReport.map((f, i) => (
                  <View key={f.family_id} style={{flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)'}}>
                    <Text style={{flex: 2, color: Colors.text, fontWeight: 'bold'}}>{i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{f.family_name}</Text>
                    <Text style={{flex: 1, color: Colors.gold, textAlign: 'center', fontWeight: 'bold'}}>{f.candles_completed} 🔥</Text>
                    <Text style={{flex: 1, color: Colors.textMuted, textAlign: 'center'}}>{Number(f.prayer_hours || 0).toFixed(1)}h</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>ALL FAMILY GROUPS ({familyGroups.length})</Text>
              {familyGroups.map(fg => (
                <View key={fg.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>👨‍👩‍👧‍👦 {fg.family_name}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 12, marginTop: 4}}>QR Code: {fg.qr_code_id}</Text>
                  
                  <View style={{marginTop: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: Radius.sm}}>
                    <Text style={[styles.codeLabel, {marginBottom: 5}]}>Send Message to Family</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Type a message..." 
                      placeholderTextColor={Colors.textMuted} 
                      value={familyMessage[fg.id] || ''} 
                      onChangeText={v => setFamilyMessage(prev => ({...prev, [fg.id]: v}))} 
                    />
                    <TouchableOpacity style={[styles.btn, {paddingVertical: 8}]} onPress={async () => {
                      if (!familyMessage[fg.id]) return Alert.alert('Error', 'Message cannot be empty');
                      try {
                        await apiClient.post(`/platform/family/${fg.id}/message`, { message: familyMessage[fg.id] });
                        setFamilyMessage(prev => ({...prev, [fg.id]: ''}));
                        Alert.alert('Success', 'Message sent to family members!');
                      } catch(e) { Alert.alert('Error', e.message); }
                    }}>
                      <Text style={styles.btnText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* YOUTH GROUPS TAB */}
          {activeTab === 'groups' && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Create Youth Group</Text>
                <TextInput style={styles.input} placeholder="Group Name (e.g. Teen Warriors)" placeholderTextColor={Colors.textMuted} value={youthGroupForm.group_name} onChangeText={v => setYouthGroupForm(f => ({...f, group_name: v}))} />
                <TouchableOpacity style={styles.btn} onPress={async () => {
                  try {
                    await apiClient.post('/platform/youth/create', youthGroupForm);
                    setYouthGroupForm({group_name: ''});
                    Alert.alert('Success', 'Youth group created!'); loadData();
                  } catch(e) { Alert.alert('Error', e.message); }
                }}>
                  <Text style={styles.btnText}>Create Group</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>ALL YOUTH GROUPS ({youthGroups.length})</Text>
              {youthGroups.map(yg => (
                <View key={yg.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>🔥 {yg.group_name}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 12, marginTop: 4}}>Invite Code: {yg.qr_code_id}</Text>
                  
                  <View style={{marginTop: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: Radius.sm}}>
                    <Text style={[styles.codeLabel, {marginBottom: 5}]}>Broadcast to Youth Group</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Type an announcement/message..." 
                      placeholderTextColor={Colors.textMuted} 
                      multiline
                      value={youthMessage[yg.id] || ''} 
                      onChangeText={v => setYouthMessage(prev => ({...prev, [yg.id]: v}))} 
                    />
                    
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <TouchableOpacity style={[styles.btn, {paddingVertical: 8, flex: 1, marginRight: 5}]} onPress={async () => {
                        if (!youthMessage[yg.id]) return Alert.alert('Error', 'Message cannot be empty');
                        try {
                          await apiClient.post(`/platform/youth/${yg.id}/post`, { content: youthMessage[yg.id] });
                          setYouthMessage(prev => ({...prev, [yg.id]: ''}));
                          Alert.alert('Success', 'Message broadcasted to youth!');
                        } catch(e) { Alert.alert('Error', e.message); }
                      }}>
                        <Text style={styles.btnText}>Send Text</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={[styles.btn, {paddingVertical: 8, backgroundColor: Colors.dark, borderWidth: 1, borderColor: Colors.gold, flex: 1, marginLeft: 5}]} onPress={async () => {
                        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
                        if (!result.canceled) {
                          const file = result.assets[0];
                          const formData = new FormData();
                          formData.append('media', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' });
                          if (youthMessage[yg.id]) formData.append('content', youthMessage[yg.id]);
                          try {
                            await apiClient.post(`/platform/youth/${yg.id}/post`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 });
                            setYouthMessage(prev => ({...prev, [yg.id]: ''}));
                            Alert.alert('Success', 'Media and message broadcasted!');
                          } catch(e) { Alert.alert('Error', e.message); }
                        }
                      }}>
                        <Text style={[styles.btnText, {color: Colors.gold}]}>Upload Media</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TESTIMONIES TAB */}
          {activeTab === 'testimonies' && (
            <View>
              <Text style={styles.sectionTitle}>MEMBER TESTIMONIES ({testimonies.length})</Text>
              {testimonies.map(t => (
                <View key={t.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>{t.title}</Text>
                  <Text style={{color: Colors.text, fontSize: 14, marginVertical: 8}}>{t.content}</Text>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={{color: Colors.textMuted, fontSize: 12}}>By: {t.member_name} • {t.is_public ? '🌐 Public' : '🔒 Private'}</Text>
                    <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6}]} onPress={() => handleDeleteTestimony(t.id)}>
                      <Text style={styles.approveBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {testimonies.length === 0 && <Text style={{color: Colors.textDim, fontStyle: 'italic', textAlign: 'center', marginTop: 20}}>No testimonies found.</Text>}
            </View>
          )}

          {/* PRAYER GROUPS TAB */}
          {activeTab === 'prayer_groups' && (
            <View>
              <Text style={styles.sectionTitle}>CREATE PRAYER GROUP</Text>
              <View style={styles.groupCard}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Group Name" 
                  placeholderTextColor={Colors.textMuted}
                  value={prayerGroupForm.name}
                  onChangeText={v => setPrayerGroupForm(prev => ({...prev, name: v}))}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Leader Name" 
                  placeholderTextColor={Colors.textMuted}
                  value={prayerGroupForm.leader_name}
                  onChangeText={v => setPrayerGroupForm(prev => ({...prev, leader_name: v}))}
                />
                <TextInput 
                  style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
                  placeholder="Description" 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  value={prayerGroupForm.description}
                  onChangeText={v => setPrayerGroupForm(prev => ({...prev, description: v}))}
                />
                <TouchableOpacity style={styles.btn} onPress={handleCreatePrayerGroup}>
                  <Text style={styles.btnText}>CREATE PRAYER GROUP</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>EXISTING PRAYER GROUPS ({prayerGroups.length})</Text>
              {prayerGroups.map(pg => (
                <View key={pg.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>⭕ {pg.name}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 13, marginTop: 4}}>{pg.description || 'No description.'}</Text>
                  <Text style={{color: Colors.gold, fontSize: 12, marginTop: 8, fontWeight: 'bold'}}>Leader: {pg.leader_name || 'N/A'} • Members: {pg.member_count || 0}</Text>
                </View>
              ))}
            </View>
          )}

          {/* WORSHIP PLAYLISTS & CHOIR TAB */}
          {activeTab === 'playlists_choir' && (
            <View>
              <Text style={styles.sectionTitle}>CREATE WORSHIP PLAYLIST</Text>
              <View style={styles.groupCard}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Playlist Title" 
                  placeholderTextColor={Colors.textMuted}
                  value={playlistForm.title}
                  onChangeText={v => setPlaylistForm(prev => ({...prev, title: v}))}
                />
                <TextInput 
                  style={[styles.input, {height: 60, textAlignVertical: 'top'}]} 
                  placeholder="Description" 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  value={playlistForm.description}
                  onChangeText={v => setPlaylistForm(prev => ({...prev, description: v}))}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Song IDs (comma separated, e.g., 1,2,5)" 
                  placeholderTextColor={Colors.textMuted}
                  value={playlistForm.song_ids}
                  onChangeText={v => setPlaylistForm(prev => ({...prev, song_ids: v}))}
                />
                <TouchableOpacity style={styles.btn} onPress={handleCreatePlaylist}>
                  <Text style={styles.btnText}>CREATE PLAYLIST</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>WORSHIP PLAYLISTS ({worshipPlaylists.length})</Text>
              {worshipPlaylists.map(wp => (
                <View key={wp.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>🎼 {wp.title}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 13, marginTop: 4}}>{wp.description || 'No description.'}</Text>
                  <Text style={{color: Colors.textDim, fontSize: 12, marginTop: 8}}>Songs Count: {wp.songs ? wp.songs.length : 0}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>CHOIR PRACTICE MATERIALS ({choirMaterials.length})</Text>
              {choirMaterials.map(cm => (
                <View key={cm.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>📄 {cm.title}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 12}}>{cm.description || 'No description.'}</Text>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
                    <Text style={{color: Colors.gold, fontSize: 11, textTransform: 'uppercase'}}>{cm.media_type || 'pdf'}</Text>
                    <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6}]} onPress={() => handleDeleteChoirMaterial(cm.id)}>
                      <Text style={styles.approveBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* DAILY CHALLENGES TAB */}
          {activeTab === 'challenges' && (
            <View>
              <Text style={styles.sectionTitle}>CREATE DAILY FAITH CHALLENGE</Text>
              <View style={styles.groupCard}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Challenge Title" 
                  placeholderTextColor={Colors.textMuted}
                  value={challengeForm.title}
                  onChangeText={v => setChallengeForm(prev => ({...prev, title: v}))}
                />
                <TextInput 
                  style={[styles.input, {height: 60, textAlignVertical: 'top'}]} 
                  placeholder="Description" 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  value={challengeForm.description}
                  onChangeText={v => setChallengeForm(prev => ({...prev, description: v}))}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Challenge Date (YYYY-MM-DD, optional)" 
                  placeholderTextColor={Colors.textMuted}
                  value={challengeForm.challenge_date}
                  onChangeText={v => setChallengeForm(prev => ({...prev, challenge_date: v}))}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Category (e.g. Faith, Prayer, Love)" 
                  placeholderTextColor={Colors.textMuted}
                  value={challengeForm.category}
                  onChangeText={v => setChallengeForm(prev => ({...prev, category: v}))}
                />
                <TouchableOpacity style={styles.btn} onPress={handleCreateChallenge}>
                  <Text style={styles.btnText}>CREATE CHALLENGE</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>ACTIVE DAILY CHALLENGES ({challenges.length})</Text>
              {challenges.map(c => (
                <View key={c.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>🏆 {c.title}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 13, marginTop: 4}}>{c.description}</Text>
                  <Text style={{color: Colors.gold, fontSize: 12, marginTop: 8}}>Date: {c.challenge_date || 'All days'} • Category: {c.category || 'Faith'}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CHILDREN STORIES TAB */}
          {activeTab === 'children_stories' && (
            <View>
              <Text style={styles.sectionTitle}>UPLOAD CHILDREN STORY</Text>
              <View style={styles.groupCard}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Story Title" 
                  placeholderTextColor={Colors.textMuted}
                  value={childrenStoryForm.title}
                  onChangeText={v => setChildrenStoryForm(prev => ({...prev, title: v}))}
                />
                <TextInput 
                  style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
                  placeholder="Story Text Content" 
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  value={childrenStoryForm.content}
                  onChangeText={v => setChildrenStoryForm(prev => ({...prev, content: v}))}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Video URL (Optional, or upload file below)" 
                  placeholderTextColor={Colors.textMuted}
                  value={childrenStoryForm.url}
                  onChangeText={v => setChildrenStoryForm(prev => ({...prev, url: v}))}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Age Group (e.g. 5-8, 9-12, All)" 
                  placeholderTextColor={Colors.textMuted}
                  value={childrenStoryForm.age_group}
                  onChangeText={v => setChildrenStoryForm(prev => ({...prev, age_group: v}))}
                />
                
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                  <TouchableOpacity 
                    style={[styles.approveBtn, {flex: 1, backgroundColor: selectedFile ? Colors.gold : 'rgba(255,255,255,0.08)'}]} 
                    onPress={async () => {
                      const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
                      if (!result.canceled) setSelectedFile(result.assets[0]);
                    }}
                  >
                    <Text style={[styles.approveBtnText, {color: selectedFile ? '#000' : Colors.text}]}>
                      {selectedFile ? `Selected: ${selectedFile.name.substring(0, 15)}...` : 'Pick Video File'}
                    </Text>
                  </TouchableOpacity>
                  {selectedFile && (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={clearSelectedFile}>
                      <Text style={{color: Colors.error, fontWeight: 'bold'}}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={[styles.btn, submittingStory && {opacity: 0.6}]} onPress={handleCreateStory} disabled={submittingStory}>
                  {submittingStory ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.btnText}>UPLOAD STORY</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>STORIES LIST ({childrenStories.length})</Text>
              {childrenStories.map(cs => (
                <View key={cs.id} style={styles.groupCard}>
                  <Text style={styles.groupName}>👼 {cs.title}</Text>
                  <Text style={{color: Colors.textMuted, fontSize: 13, marginVertical: 4}} numberOfLines={2}>{cs.content}</Text>
                  <Text style={{color: Colors.gold, fontSize: 12}}>Age Group: {cs.age_group} • Media: {cs.media_type}</Text>
                  {cs.video_url ? <Text style={{color: Colors.textDim, fontSize: 11, marginTop: 4}} numberOfLines={1}>Video URI: {cs.video_url}</Text> : null}
                  <TouchableOpacity style={[styles.approveBtn, {backgroundColor: Colors.error, marginTop: 10, alignSelf: 'flex-start'}]} onPress={() => handleDeleteStory(cs.id)}>
                    <Text style={styles.approveBtnText}>Delete Story</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.sectionTitle}>CHILDREN STORY COMPLETIONS REPORT</Text>
              <View style={[styles.groupCard, { padding: 0, overflow: 'hidden' }]}>
                <View style={{flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder}}>
                  <Text style={{flex: 1.5, color: Colors.gold, fontWeight: 'bold', fontSize: 11}}>Child Name</Text>
                  <Text style={{flex: 1, color: Colors.textMuted, textAlign: 'center', fontSize: 11}}>Class</Text>
                  <Text style={{flex: 2, color: Colors.textMuted, fontSize: 11}}>Story Completed</Text>
                  <Text style={{flex: 1.5, color: Colors.textMuted, fontSize: 11, textAlign: 'right'}}>Date</Text>
                </View>
                {storyCompletions.length === 0 && <Text style={{padding: 15, color: Colors.textDim, textAlign: 'center'}}>No completions logged yet.</Text>}
                {storyCompletions.map(sc => (
                  <View key={sc.id} style={{flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)', alignItems: 'center'}}>
                    <View style={{flex: 1.5}}>
                      <Text style={{color: Colors.text, fontWeight: 'bold', fontSize: 12}}>{sc.child_name}</Text>
                      {sc.student_phone ? <Text style={{color: Colors.textDim, fontSize: 9}}>{sc.student_phone}</Text> : null}
                    </View>
                    <Text style={{flex: 1, color: Colors.text, textAlign: 'center', fontSize: 12}}>{sc.class}</Text>
                    <Text style={{flex: 2, color: Colors.gold, fontSize: 11}} numberOfLines={1}>{sc.story_title}</Text>
                    <Text style={{flex: 1.5, color: Colors.textMuted, fontSize: 10, textAlign: 'right'}}>{new Date(sc.completed_at).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>SYSTEM SETTINGS</Text>
              <View style={[styles.groupCard, { borderColor: Colors.error }]}>
                <Text style={[styles.groupName, { color: Colors.error, marginBottom: 10 }]}>⚠️ Reset Entire Database</Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
                  This will PERMANENTLY DELETE all members, family groups, youth groups, media, prayers, and events. 
                  Only the Admin login credentials will be preserved. This action CANNOT be undone.
                </Text>
                <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.error }]} onPress={() => {
                  Alert.alert(
                    "Are you absolutely sure?", 
                    "This will delete ALL data in the app. There is no going back.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Yes, Delete Everything", 
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await apiClient.post('/platform/reset-database');
                            Alert.alert('Success', 'Database has been reset.');
                            loadData();
                          } catch (e) {
                            Alert.alert('Error', e.message);
                          }
                        }
                      }
                    ]
                  );
                }}>
                  <Text style={styles.btnText}>RESET DATABASE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient colors={['rgba(21, 28, 48, 0.97)', 'rgba(9, 13, 23, 0.99)']} style={StyleSheet.absoluteFill} />
        <Text style={styles.appTitle}>St Antony Church</Text>
        <ScrollView contentContainerStyle={styles.menuList}>
          {[
            { label: 'Overview', icon: '📈', tab: 'overview' },
            { label: 'Members', icon: '👥', tab: 'members' },
            { label: 'Youth Groups', icon: '🔥', tab: 'groups' },
            { label: 'Approvals', icon: '⏳', tab: 'approvals' },
            { label: 'Videos', icon: '🎬', tab: 'videos' },
            { label: 'Audio', icon: '🎵', tab: 'audio' },
            { label: 'Events', icon: '📅', tab: 'events' },
            { label: 'Galleries', icon: '🖼️', tab: 'galleries' },
            { label: 'Schedules', icon: '⏰', tab: 'schedules' },
            { label: 'Devotionals', icon: '📖', tab: 'devotionals' },
            { label: 'Worship', icon: '🎤', tab: 'worship' },
            { label: 'Quizzes', icon: '❓', tab: 'quizzes' },
            { label: 'Podcasts', icon: '🎧', tab: 'podcasts' },
            { label: 'Reading Plans', icon: '📚', tab: 'reading_plans' },
            { label: 'Announcements', icon: '📢', tab: 'announcements' },
            { label: 'Prayers', icon: '🙏', tab: 'prayers' },
            { label: 'Verses', icon: '📖', tab: 'verses' },
            { label: 'Family Groups', icon: '👨‍👩‍👧‍👦', tab: 'family_groups' },
            { label: 'Testimonies', icon: '💬', tab: 'testimonies' },
            { label: 'Prayer Groups', icon: '⭕', tab: 'prayer_groups' },
            { label: 'Playlists & Choir', icon: '🎼', tab: 'playlists_choir' },
            { label: 'Daily Challenges', icon: '🏆', tab: 'challenges' },
            { label: 'Children Stories', icon: '👼', tab: 'children_stories' },
            { label: 'Activity', icon: '💬', tab: 'activity' },
            { label: 'Settings', icon: '⚙️', tab: 'settings' },
          ].map(item => (
            <TouchableOpacity 
              key={item.label} 
              style={[styles.menuItem, activeTab === item.tab && styles.activeMenuItem]} 
              onPress={() => handleMenuSelect(item.tab)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, activeTab === item.tab && styles.activeMenuLabel]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuSelect('logout')}><Text style={styles.menuIcon}>⏻</Text><Text style={[styles.menuLabel, {color: Colors.error}]}>Log Out</Text></TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {selectedPrayerId !== null && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Mark Prayer as Answered</Text>
            <Text style={styles.dialogSubtitle}>Enter a praise testimony/report to inspire the church family:</Text>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              placeholder="How did God answer this prayer request?" 
              placeholderTextColor={Colors.textMuted}
              multiline 
              value={testimonyText} 
              onChangeText={setTestimonyText} 
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity 
                style={[styles.dialogBtn, { backgroundColor: 'rgba(255,255,255,0.06)' }]} 
                onPress={() => {
                  setSelectedPrayerId(null);
                  setTestimonyText('');
                }}
              >
                <Text style={[styles.dialogBtnText, { color: Colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dialogBtn, { backgroundColor: Colors.success }]} 
                onPress={async () => {
                  try {
                    await apiClient.patch(`/prayer/${selectedPrayerId}/answered`, { testimony: testimonyText.trim() });
                    setSelectedPrayerId(null);
                    setTestimonyText('');
                    Alert.alert('Praise God', 'Prayer request marked as answered successfully!');
                    loadData();
                  } catch (e) {
                    Alert.alert('Error', e.message);
                  }
                }}
              >
                <Text style={styles.dialogBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  greeting: { fontSize: 12, color: Colors.textMuted },
  userName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  logoutBtn: { backgroundColor: 'rgba(231,76,60,0.12)', borderWidth: 1, borderColor: 'rgba(231,76,60,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  logoutText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 9999,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10000,
    paddingTop: 40,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    paddingHorizontal: Spacing.md,
    marginTop: 15,
    letterSpacing: 0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileSub: {
    color: '#64d2ff',
    fontSize: 11,
    marginTop: 1,
  },
  profileChevron: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: Spacing.md,
    marginVertical: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64d2ff',
    paddingHorizontal: Spacing.md,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  menuList: {
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginHorizontal: 8,
    borderRadius: Radius.sm,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuIcon: {
    fontSize: 18,
    width: 24,
    marginRight: 12,
    textAlign: 'center',
    color: '#ffffff',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  activeMenuLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  logoutItem: {
    marginTop: 5,
  },
  menuBtn: { padding: 4, marginRight: 2 },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },

  container: { padding: Spacing.md },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 1.2, marginBottom: Spacing.md, marginTop: 10 },
  
  // Overview stats
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, padding: Spacing.md, alignItems: 'center' },
  cardIcon: { fontSize: 24, marginBottom: Spacing.xs },
  cardVal: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  cardLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  cardSubText: { fontSize: 10, color: Colors.success, marginTop: 4, fontWeight: '700' },
  cardBadge: { fontSize: 9, color: Colors.warning, backgroundColor: 'rgba(243,156,18,0.1)', borderWidth: 1, borderColor: Colors.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, marginTop: 6, fontWeight: '700' },
  
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
  
  // Forms & Groups
  formCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.md },
  formTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', color: Colors.text, paddingHorizontal: 12, paddingVertical: 10, borderRadius: Radius.sm, fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  btn: { backgroundColor: Colors.gold, paddingVertical: 12, borderRadius: Radius.sm, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.dark, fontWeight: 'bold', fontSize: 14 },
  
  groupCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: 10 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  groupName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  groupDate: { fontSize: 11, color: Colors.textDim },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: Radius.sm },
  codeLabel: { fontSize: 12, color: Colors.textMuted },
  codeValue: { fontSize: 14, fontWeight: '700', color: Colors.gold, fontFamily: 'monospace' },

  // Approvals
  approvalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: 10 },
  memberInfo: { flex: 1, paddingRight: 10 },
  memberName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  memberPhone: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  targetGroup: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  approveBtn: { backgroundColor: Colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.sm },
  approveBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  // Picker & Switch Elements
  filePickerBtn: { borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.gold, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: Spacing.md, backgroundColor: 'rgba(200, 153, 26, 0.04)', alignItems: 'center', justifyContent: 'center' },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, paddingVertical: 4 },
  switchLabel: { color: Colors.text, fontSize: 14, fontWeight: '500' },

  // Badges & Tag buttons
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 9, fontWeight: '700', color: Colors.textMuted },
  subTabContainer: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  subTabButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.03)', minWidth: 60, alignItems: 'center' },
  subTabButtonActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  subTabText: { fontSize: 12, color: Colors.textMuted },
  subTabTextActive: { color: Colors.dark, fontWeight: '700' },

  // Activity Feed UI elements
  activityRow: { flexDirection: 'row', gap: 12, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: 10, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'flex-start' },
  activityIcon: { fontSize: 20 },
  activityText: { fontSize: 14, color: Colors.text, lineHeight: 18 },
  activitySub: { fontSize: 11, color: Colors.textDim, marginTop: 4 },

  // Dialog Overlay & testimony inputs
  dialogOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 11000 },
  dialogContainer: { width: '85%', backgroundColor: Colors.dark2, borderRadius: Radius.md, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.glassBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 6, textAlign: 'center' },
  dialogSubtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 16, textAlign: 'center', lineHeight: 18 },
  dialogButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  dialogBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.sm, minWidth: 80, alignItems: 'center' },
  dialogBtnText: { fontSize: 13, color: Colors.white, fontWeight: '700' },
});
