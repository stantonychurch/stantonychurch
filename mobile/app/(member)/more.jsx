import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity, ActivityIndicator, TextInput, Switch, Alert, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerContext } from './_layout';
import apiClient, { getPlatform, postPlatform } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '../../src/config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');
const CLASSES = ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function MoreScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t, lang } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  
  // Section state: null (menu), 'fasting', 'reading', 'services', 'podcasts', 'stories', 'testimonies', 'prayer_groups', 'playlists_choir', 'challenges', 'memorization'
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fasting form
  const [fastingPurpose, setFastingPurpose] = useState('');
  const [fastingNotes, setFastingNotes] = useState('');
  const [fastingStarting, setFastingStarting] = useState(false);

  // Stories states
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [showChildRegModal, setShowChildRegModal] = useState(false);
  const [childForm, setChildForm] = useState({ child_name: '', dob: '', class_name: 'LKG', student_phone: '' });
  const [selectedStory, setSelectedStory] = useState(null);

  // Testimonies states
  const [testimonies, setTestimonies] = useState([]);
  const [myTestimonies, setMyTestimonies] = useState([]);
  const [testimonyForm, setTestimonyForm] = useState({ title: '', content: '', is_public: true });
  const [submittingTestimony, setSubmittingTestimony] = useState(false);

  // Prayer Groups states
  const [prayerGroups, setPrayerGroups] = useState([]);

  // Worship Playlists & Choir states
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [choirMaterials, setChoirMaterials] = useState([]);
  const [choirForm, setChoirForm] = useState({ title: '', description: '' });
  const [selectedChoirFile, setSelectedChoirFile] = useState(null);
  const [uploadingChoir, setUploadingChoir] = useState(false);

  // Daily Challenges states
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  // Memorization states
  const [memorizations, setMemorizations] = useState([]);
  const [memorizationForm, setMemorizationForm] = useState({ verse: '', reference: '' });

  async function loadSectionData(sec) {
    setLoading(true);
    try {
      let res;
      if (sec === 'fasting') {
        res = await getPlatform(`/fasting/${user?.id}`);
        setData(res?.data || []);
      } else if (sec === 'reading') {
        res = await getPlatform('/reading-plans');
        setData(res?.data || []);
      } else if (sec === 'services') {
        res = await getPlatform('/service-schedules');
        setData(res?.data || []);
      } else if (sec === 'podcasts') {
        res = await getPlatform('/podcasts');
        setData(res?.data || []);
      } else if (sec === 'stories') {
        const [storiesRes, profilesRes] = await Promise.all([
          getPlatform('/children-stories'),
          getPlatform('/children-profiles')
        ]);
        setData(storiesRes.data || []);
        setChildProfiles(profilesRes.data || []);
      } else if (sec === 'testimonies') {
        const [pubRes, mineRes] = await Promise.all([
          getPlatform('/testimonies'),
          getPlatform(`/testimonies/mine/${user?.id}`)
        ]);
        setTestimonies(pubRes.data || []);
        setMyTestimonies(mineRes.data || []);
      } else if (sec === 'prayer_groups') {
        res = await getPlatform('/prayer-groups');
        setPrayerGroups(res.data || []);
      } else if (sec === 'playlists_choir') {
        const [playlistsRes, choirRes] = await Promise.all([
          getPlatform('/worship-playlists'),
          getPlatform('/choir-materials')
        ]);
        setPlaylists(playlistsRes.data || []);
        setChoirMaterials(choirRes.data || []);
      } else if (sec === 'challenges') {
        const [activeRes, completedRes] = await Promise.all([
          getPlatform('/challenges'),
          getPlatform(`/challenges/completed/${user?.id}`)
        ]);
        setChallenges(Array.isArray(activeRes.data) ? activeRes.data : activeRes.data ? [activeRes.data] : []);
        setCompletedChallenges(completedRes.data || []);
      } else if (sec === 'memorization') {
        res = await getPlatform(`/memorization/${user?.id}`);
        setMemorizations(res?.data || []);
      }
    } catch (_) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSectionSelect(sec) {
    setActiveSection(sec);
    setSelectedStory(null);
    setSelectedPlaylist(null);
    setSelectedChoirFile(null);
    if (sec) {
      loadSectionData(sec);
    }
  }

  async function handleStartFasting() {
    if (!fastingPurpose.trim()) return;
    setFastingStarting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await postPlatform('/fasting', {
        start_date: today,
        purpose: fastingPurpose.trim(),
        notes: fastingNotes.trim()
      });
      setFastingPurpose('');
      setFastingNotes('');
      await loadSectionData('fasting');
    } catch (_) {} finally {
      setFastingStarting(false);
    }
  }

  // Children Stories Handlers
  async function handleRegisterChild() {
    if (!childForm.child_name.trim() || !childForm.dob.trim()) {
      return Alert.alert('Required', 'Child Name and Date of Birth are required');
    }
    try {
      await postPlatform('/children-profiles', {
        child_name: childForm.child_name.trim(),
        dob: childForm.dob.trim(),
        class_name: childForm.class_name,
        student_phone: childForm.student_phone.trim() || null
      });
      Alert.alert('Success', 'Child profile registered!');
      setChildForm({ child_name: '', dob: '', class_name: 'LKG', student_phone: '' });
      setShowChildRegModal(false);
      loadSectionData('stories');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  }

  async function handleMarkStoryComplete(storyId) {
    if (!selectedChildId) return Alert.alert('Error', 'Please select a child profile first');
    try {
      await postPlatform(`/children-stories/${storyId}/complete`, { child_id: selectedChildId });
      Alert.alert('Congratulations! 🎉', 'Story completed. Keep learning the word of God!');
      setSelectedStory(null);
      loadSectionData('stories');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  }

  // Testimonies Handlers
  async function handleSubmitTestimony() {
    if (!testimonyForm.title.trim() || !testimonyForm.content.trim()) {
      return Alert.alert('Required', 'Title and Content are required');
    }
    setSubmittingTestimony(true);
    try {
      await postPlatform('/testimonies', {
        title: testimonyForm.title.trim(),
        content: testimonyForm.content.trim(),
        is_public: testimonyForm.is_public
      });
      Alert.alert('Success', 'Testimony submitted!');
      setTestimonyForm({ title: '', content: '', is_public: true });
      loadSectionData('testimonies');
    } catch(e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmittingTestimony(false);
    }
  }

  async function handleDeleteTestimony(id) {
    Alert.alert('Delete', 'Delete testimony?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/platform/testimonies/${id}`);
          Alert.alert('Success', 'Testimony removed');
          loadSectionData('testimonies');
        } catch(e) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  // Prayer Group Handlers
  async function handleJoinPrayerGroup(groupId) {
    try {
      await postPlatform(`/prayer-groups/${groupId}/join`);
      Alert.alert('Joined ⭕', 'You have successfully joined the prayer group');
      loadSectionData('prayer_groups');
    } catch(e) {
      Alert.alert('Error', e.message);
    }
  }

  // Choir Materials Handlers
  async function handlePickChoirFile() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedChoirFile(res.assets[0]);
      }
    } catch(e) { console.log(e); }
  }

  async function handleUploadChoir() {
    if (!choirForm.title.trim()) return Alert.alert('Required', 'Enter material title');
    if (!selectedChoirFile) return Alert.alert('Required', 'Please pick a file to upload');
    setUploadingChoir(true);
    try {
      const formData = new FormData();
      formData.append('title', choirForm.title.trim());
      formData.append('description', choirForm.description.trim());
      formData.append('file', {
        uri: selectedChoirFile.uri,
        name: selectedChoirFile.name,
        type: selectedChoirFile.mimeType || 'application/octet-stream'
      });
      await apiClient.post('/platform/choir-materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000
      });
      Alert.alert('Success', 'Choir material uploaded successfully!');
      setChoirForm({ title: '', description: '' });
      setSelectedChoirFile(null);
      loadSectionData('playlists_choir');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setUploadingChoir(false);
    }
  }

  // Challenge Handlers
  async function handleCompleteChallenge(challengeId) {
    try {
      await postPlatform(`/challenges/${challengeId}/complete`);
      Alert.alert('Completed! 🎉', 'Fabulous! You have completed this daily challenge');
      loadSectionData('challenges');
    } catch(e) { Alert.alert('Error', e.message); }
  }

  // Memorization Handlers
  async function handleAddMemorization() {
    if (!memorizationForm.verse.trim() || !memorizationForm.reference.trim()) {
      return Alert.alert('Required', 'Verse and Reference are required');
    }
    try {
      await postPlatform('/memorization', {
        verse: memorizationForm.verse.trim(),
        reference: memorizationForm.reference.trim()
      });
      setMemorizationForm({ verse: '', reference: '' });
      loadSectionData('memorization');
    } catch(e) { Alert.alert('Error', e.message); }
  }

  async function handleMasterMemorization(id) {
    try {
      await apiClient.patch(`/platform/memorization/${id}/master`);
      Alert.alert('Congratulations! 🎉', 'Keep memorizing scripture to feed your soul.');
      loadSectionData('memorization');
    } catch(e) { Alert.alert('Error', e.message); }
  }

  async function handleDeleteMemorization(id) {
    try {
      await apiClient.delete(`/platform/memorization/${id}`);
      loadSectionData('memorization');
    } catch(e) { Alert.alert('Error', e.message); }
  }

  const menuItems = [
    { key: 'reading', title: t('reading'), desc: t('reading_desc') },
    { key: 'fasting', title: t('fasting'), desc: t('fasting_desc') },
    { key: 'services', title: t('services'), desc: t('services_desc') },
    { key: 'podcasts', title: t('podcasts'), desc: t('podcasts_desc') },
    { key: 'stories', title: '👼 Children Stories', desc: 'Read biblical stories and track progress' },
    { key: 'testimonies', title: '💬 Testimonies', desc: 'Read public praise reports or post your own' },
    { key: 'prayer_groups', title: '⭕ Prayer Groups', desc: 'Find and join Small Prayer circles' },
    { key: 'playlists_choir', title: '🎼 Worship & Choir', desc: 'Access worship songlists & practice sheets' },
    { key: 'challenges', title: '🏆 Daily Challenges', desc: 'Participate in faith building challenges' },
    { key: 'memorization', title: '📖 Scripture Memorization', desc: 'Memorize bible verses and keep progress' },
  ];

  if (activeSection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => handleSectionSelect(null)} style={styles.backBtnSmall}>
            <Text style={styles.backTextSmall}>{t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {activeSection === 'reading' && t('reading_plans')}
            {activeSection === 'fasting' && t('fasting')}
            {activeSection === 'services' && t('services')}
            {activeSection === 'podcasts' && t('podcasts')}
            {activeSection === 'stories' && 'Children Stories'}
            {activeSection === 'testimonies' && 'Testimonies'}
            {activeSection === 'prayer_groups' && 'Prayer Groups'}
            {activeSection === 'playlists_choir' && 'Worship & Choir'}
            {activeSection === 'challenges' && 'Daily Challenges'}
            {activeSection === 'memorization' && 'Scripture Memorization'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.gold} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.sectionContainer}>
            {/* READING PLANS SECTION */}
            {activeSection === 'reading' && (
              <View>
                {data.map(plan => (
                  <View key={plan.id} style={styles.planCard}>
                    <Text style={styles.planDuration}>{plan.duration_days} {t('day_plan')} ({plan.language === 'ta' ? t('tamil') : t('english')})</Text>
                    <Text style={styles.planTitle}>{lang === 'ta' && plan.title_tamil ? plan.title_tamil : plan.title}</Text>
                    {plan.description || plan.description_tamil ? <Text style={styles.planDesc}>{lang === 'ta' && plan.description_tamil ? plan.description_tamil : plan.description}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_reading_plans')}</Text>}
              </View>
            )}

            {/* FASTING TRACKER SECTION */}
            {activeSection === 'fasting' && (
              <View>
                <View style={styles.composeCard}>
                  <Text style={styles.composeTitle}>{t('log_a_fast')}</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder={t('fasting_purpose')} 
                    placeholderTextColor="#888"
                    value={fastingPurpose}
                    onChangeText={setFastingPurpose}
                  />
                  <TextInput 
                    style={[styles.input, { height: 70 }]} 
                    placeholder={t('notes_optional')} 
                    placeholderTextColor="#888"
                    multiline
                    value={fastingNotes}
                    onChangeText={setFastingNotes}
                  />
                  <TouchableOpacity 
                    style={[styles.saveBtn, !fastingPurpose.trim() && styles.saveBtnDisabled]}
                    onPress={handleStartFasting}
                    disabled={!fastingPurpose.trim() || fastingStarting}
                  >
                    {fastingStarting ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.saveBtnText}>{t('log_fast_btn')}</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>{t('your_fasting_log')}</Text>
                {data.map(fast => (
                  <View key={fast.id} style={styles.fastCard}>
                    <View style={styles.fastHeader}>
                      <Text style={styles.fastDate}>🗓️ {fast.start_date}</Text>
                      {fast.end_date ? <Text style={styles.fastDate}>to {fast.end_date}</Text> : null}
                    </View>
                    <Text style={styles.fastPurpose}>{t('purpose')} {fast.purpose}</Text>
                    {fast.notes ? <Text style={styles.fastNotes}>{fast.notes}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_fasting_records')}</Text>}
              </View>
            )}

            {/* SERVICE SCHEDULES SECTION */}
            {activeSection === 'services' && (
              <View>
                {data.map(sched => (
                  <View key={sched.id} style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <Text style={styles.scheduleDay}>{lang === 'ta' && sched.day_of_week_tamil ? sched.day_of_week_tamil : sched.day_of_week}</Text>
                      <Text style={styles.scheduleTime}>🕐 {sched.service_time}</Text>
                    </View>
                    <Text style={styles.scheduleType}>{lang === 'ta' && sched.service_type_tamil ? sched.service_type_tamil : sched.service_type}</Text>
                    <Text style={styles.scheduleLocation}>📍 {sched.location || t('church_sanctuary')}</Text>
                    {sched.description || sched.description_tamil ? <Text style={styles.scheduleDesc}>{lang === 'ta' && sched.description_tamil ? sched.description_tamil : sched.description}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_service_schedules')}</Text>}
              </View>
            )}

            {/* PODCASTS SECTION */}
            {activeSection === 'podcasts' && (
              <View>
                {data.map(pod => (
                  <View key={pod.id} style={styles.podcastCard}>
                    <Text style={styles.podcastLang}>{pod.language === 'ta' ? t('tamil') : t('english')}</Text>
                    <Text style={styles.podcastTitle}>{lang === 'ta' && pod.title_tamil ? pod.title_tamil : pod.title}</Text>
                    <Text style={styles.podcastPastor}>🎤 {pod.pastor || t('pastor')}</Text>
                    {pod.description || pod.description_tamil ? <Text style={styles.podcastDesc}>{lang === 'ta' && pod.description_tamil ? pod.description_tamil : pod.description}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_podcasts')}</Text>}
              </View>
            )}

            {/* CHILDREN STORIES SECTION */}
            {activeSection === 'stories' && (
              <View>
                {selectedStory ? (
                  <View>
                    <TouchableOpacity onPress={() => setSelectedStory(null)} style={styles.backBtnSmall}>
                      <Text style={styles.backTextSmall}>← Back to Stories</Text>
                    </TouchableOpacity>
                    <Text style={{fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 8}}>{selectedStory.title}</Text>
                    <Text style={{fontSize: 11, color: Colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 15}}>Age Group: {selectedStory.age_group}</Text>
                    
                    {selectedStory.video_url ? (
                      selectedStory.video_url.includes('youtube.com') || selectedStory.video_url.includes('youtu.be') ? (
                        <View style={{width: '100%', height: 210, backgroundColor: '#000', borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.md}}>
                          <WebView
                            style={{width: '100%', height: '100%'}}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            allowsFullscreenVideo={true}
                            source={{ uri: `https://www.youtube.com/embed/${selectedStory.video_url.includes('youtu.be/') ? selectedStory.video_url.split('youtu.be/')[1]?.split('?')[0] : selectedStory.video_url.split('v=')[1]?.split('&')[0]}` }}
                          />
                        </View>
                      ) : (
                        <View style={{width: '100%', height: 210, backgroundColor: '#000', borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.md}}>
                          <Video
                            style={{width: '100%', height: '100%'}}
                            source={{ uri: selectedStory.video_url.startsWith('http') ? selectedStory.video_url : `${SERVER_URL}${selectedStory.video_url}` }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                          />
                        </View>
                      )
                    ) : null}

                    <Text style={{fontSize: 15, color: Colors.text, lineHeight: 24, marginBottom: 25}}>{selectedStory.content}</Text>
                    
                    <Text style={styles.sectionLabel}>Who is reading/watching this story?</Text>
                    {childProfiles.length === 0 ? (
                      <View style={[styles.composeCard, {alignItems: 'center', padding: 20}]}>
                        <Text style={{color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 15}}>You need to register a child profile before marking completions.</Text>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => setShowChildRegModal(true)}>
                          <Text style={styles.saveBtnText}>Register Child Profile</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10}}>
                          {childProfiles.map(p => (
                            <TouchableOpacity 
                              key={p.id} 
                              style={[{padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)'}, selectedChildId === p.id && {borderColor: Colors.gold, backgroundColor: 'rgba(200,153,26,0.1)'}]} 
                              onPress={() => setSelectedChildId(p.id)}
                            >
                              <Text style={{color: selectedChildId === p.id ? Colors.gold : Colors.text, fontWeight: 'bold'}}>{p.child_name} ({p.class})</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        
                        <TouchableOpacity 
                          style={[styles.saveBtn, !selectedChildId && styles.saveBtnDisabled, {marginTop: 15}]} 
                          onPress={() => handleMarkStoryComplete(selectedStory.id)}
                          disabled={!selectedChildId}
                        >
                          <Text style={styles.saveBtnText}>Mark as Completed 🎉</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                      <Text style={styles.sectionLabel}>STORIES & BOOKS</Text>
                      <TouchableOpacity style={[styles.backBtnSmall, {backgroundColor: 'rgba(200,153,26,0.1)'}]} onPress={() => setShowChildRegModal(true)}>
                        <Text style={[styles.backTextSmall, {color: Colors.gold}]}>+ Child Profile</Text>
                      </TouchableOpacity>
                    </View>

                    {data.map(story => (
                      <TouchableOpacity key={story.id} style={styles.planCard} onPress={() => setSelectedStory(story)}>
                        <Text style={styles.planDuration}>Age Group: {story.age_group} ({story.media_type === 'video' ? '🎬 Video' : '📖 Text'})</Text>
                        <Text style={styles.planTitle}>{story.title}</Text>
                        <Text style={styles.planDesc} numberOfLines={2}>{story.content}</Text>
                      </TouchableOpacity>
                    ))}
                    {data.length === 0 && <Text style={styles.empty}>No children stories available.</Text>}
                  </View>
                )}
              </View>
            )}

            {/* TESTIMONIES SECTION */}
            {activeSection === 'testimonies' && (
              <View>
                <View style={styles.composeCard}>
                  <Text style={styles.composeTitle}>Share your Testimony</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Testimony Title" 
                    placeholderTextColor="#888"
                    value={testimonyForm.title}
                    onChangeText={v => setTestimonyForm({...testimonyForm, title: v})}
                  />
                  <TextInput 
                    style={[styles.input, { height: 80 }]} 
                    placeholder="Describe how God worked in your life..." 
                    placeholderTextColor="#888"
                    multiline
                    value={testimonyForm.content}
                    onChangeText={v => setTestimonyForm({...testimonyForm, content: v})}
                  />
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                    <Text style={{color: Colors.textMuted, fontSize: 13}}>Make testimony public</Text>
                    <Switch 
                      value={testimonyForm.is_public}
                      onValueChange={v => setTestimonyForm({...testimonyForm, is_public: v})}
                      trackColor={{ false: '#333', true: Colors.gold }}
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.saveBtn, (!testimonyForm.title.trim() || !testimonyForm.content.trim()) && styles.saveBtnDisabled]}
                    onPress={handleSubmitTestimony}
                    disabled={!testimonyForm.title.trim() || !testimonyForm.content.trim() || submittingTestimony}
                  >
                    {submittingTestimony ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.saveBtnText}>Submit Testimony</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>PUBLIC TESTIMONIES ({testimonies.length})</Text>
                {testimonies.map(t => (
                  <View key={t.id} style={styles.planCard}>
                    <Text style={styles.planTitle}>{t.title}</Text>
                    <Text style={styles.planDesc}>{t.content}</Text>
                    <Text style={{color: Colors.gold, fontSize: 11, marginTop: 10}}>By: {t.member_name} • {new Date(t.created_at).toLocaleDateString()}</Text>
                  </View>
                ))}

                <Text style={[styles.sectionLabel, {marginTop: 20}]}>MY TESTIMONIES ({myTestimonies.length})</Text>
                {myTestimonies.map(t => (
                  <View key={t.id} style={styles.planCard}>
                    <Text style={styles.planTitle}>{t.title}</Text>
                    <Text style={styles.planDesc}>{t.content}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
                      <Text style={{color: Colors.textDim, fontSize: 11}}>{t.is_public ? '🌐 Public' : '🔒 Private'}</Text>
                      <TouchableOpacity onPress={() => handleDeleteTestimony(t.id)}>
                        <Text style={{color: Colors.error, fontWeight: 'bold', fontSize: 12}}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* PRAYER GROUPS SECTION */}
            {activeSection === 'prayer_groups' && (
              <View>
                {prayerGroups.map(pg => (
                  <View key={pg.id} style={styles.planCard}>
                    <Text style={styles.planTitle}>⭕ {pg.name}</Text>
                    <Text style={styles.planDesc}>{pg.description || 'No description provided.'}</Text>
                    <Text style={{color: Colors.gold, fontSize: 12, marginVertical: 6, fontWeight: 'bold'}}>Leader: {pg.leader_name} • Members: {pg.member_count}</Text>
                    <TouchableOpacity style={[styles.saveBtn, {paddingVertical: 8, marginTop: 5}]} onPress={() => handleJoinPrayerGroup(pg.id)}>
                      <Text style={styles.saveBtnText}>Join Group</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {prayerGroups.length === 0 && <Text style={styles.empty}>No active prayer groups found.</Text>}
              </View>
            )}

            {/* PLAYLISTS & CHOIR SECTION */}
            {activeSection === 'playlists_choir' && (
              <View>
                {selectedPlaylist ? (
                  <View>
                    <TouchableOpacity onPress={() => setSelectedPlaylist(null)} style={styles.backBtnSmall}>
                      <Text style={styles.backTextSmall}>← Back to Playlists</Text>
                    </TouchableOpacity>
                    <Text style={{fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4}}>{selectedPlaylist.title}</Text>
                    <Text style={{fontSize: 13, color: Colors.textMuted, marginBottom: 15}}>{selectedPlaylist.description}</Text>
                    
                    <Text style={styles.sectionLabel}>SONGS IN THIS PLAYLIST</Text>
                    {selectedPlaylist.songs && selectedPlaylist.songs.map(song => (
                      <View key={song.id} style={styles.fastCard}>
                        <Text style={{color: Colors.gold, fontWeight: 'bold'}}>{song.title}</Text>
                        <Text style={{color: Colors.textMuted, fontSize: 12}}>Artist: {song.artist || 'N/A'}</Text>
                        {song.lyrics ? <Text style={{color: Colors.text, fontSize: 13, marginTop: 6, fontStyle: 'italic'}} numberOfLines={3}>{song.lyrics}</Text> : null}
                      </View>
                    ))}
                    {(!selectedPlaylist.songs || selectedPlaylist.songs.length === 0) && <Text style={styles.empty}>No songs in this playlist.</Text>}
                  </View>
                ) : (
                  <View>
                    {/* CHOIR UPLOAD BOX */}
                    <View style={styles.composeCard}>
                      <Text style={styles.composeTitle}>Upload Choir Practice Material</Text>
                      <TextInput 
                        style={styles.input} 
                        placeholder="Material Title" 
                        placeholderTextColor="#888"
                        value={choirForm.title}
                        onChangeText={v => setChoirForm({...choirForm, title: v})}
                      />
                      <TextInput 
                        style={[styles.input, { height: 50 }]} 
                        placeholder="Description (sheet notes, voice type...)" 
                        placeholderTextColor="#888"
                        value={choirForm.description}
                        onChangeText={v => setChoirForm({...choirForm, description: v})}
                      />
                      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                        <TouchableOpacity style={[styles.saveBtn, {flex: 1, backgroundColor: selectedChoirFile ? Colors.gold : 'rgba(255,255,255,0.08)'}]} onPress={handlePickChoirFile}>
                          <Text style={[styles.saveBtnText, {color: selectedChoirFile ? '#000' : Colors.text}]}>
                            {selectedChoirFile ? `Selected: ${selectedChoirFile.name.substring(0, 15)}...` : 'Pick File (PDF/Image/Audio/Video)'}
                          </Text>
                        </TouchableOpacity>
                        {selectedChoirFile && (
                          <TouchableOpacity style={{marginLeft: 10}} onPress={() => setSelectedChoirFile(null)}>
                            <Text style={{color: Colors.error, fontWeight: 'bold'}}>Clear</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <TouchableOpacity 
                        style={[styles.saveBtn, (!choirForm.title.trim() || !selectedChoirFile) && styles.saveBtnDisabled]}
                        onPress={handleUploadChoir}
                        disabled={!choirForm.title.trim() || !selectedChoirFile || uploadingChoir}
                      >
                        {uploadingChoir ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.saveBtnText}>Upload File</Text>}
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionLabel}>WORSHIP PLAYLISTS</Text>
                    {playlists.map(wp => (
                      <TouchableOpacity key={wp.id} style={styles.planCard} onPress={() => setSelectedPlaylist(wp)}>
                        <Text style={styles.planTitle}>🎼 {wp.title}</Text>
                        <Text style={styles.planDesc}>{wp.description || 'Access playlist worship tracks.'}</Text>
                        <Text style={{color: Colors.gold, fontSize: 11, marginTop: 8}}>Songs: {wp.songs ? wp.songs.length : 0} • Tap to view</Text>
                      </TouchableOpacity>
                    ))}

                    <Text style={[styles.sectionLabel, {marginTop: 20}]}>CHOIR MATERIALS</Text>
                    {choirMaterials.map(cm => (
                      <View key={cm.id} style={styles.fastCard}>
                        <Text style={{color: Colors.text, fontWeight: 'bold'}}>{cm.title}</Text>
                        <Text style={{color: Colors.textMuted, fontSize: 12}}>{cm.description || 'No description.'}</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
                          <Text style={{color: Colors.gold, fontSize: 11, textTransform: 'uppercase'}}>{cm.media_type}</Text>
                          {cm.url ? (
                            <TouchableOpacity onPress={() => router.push(cm.url.startsWith('http') ? cm.url : `${SERVER_URL}${cm.url}`)}>
                              <Text style={{color: Colors.gold, fontWeight: 'bold', fontSize: 12}}>Open File 📁</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    ))}
                    {choirMaterials.length === 0 && <Text style={styles.empty}>No choir sheets found.</Text>}
                  </View>
                )}
              </View>
            )}

            {/* DAILY CHALLENGES SECTION */}
            {activeSection === 'challenges' && (
              <View>
                <Text style={styles.sectionLabel}>ACTIVE FAITH CHALLENGES</Text>
                {challenges.map(c => {
                  const isDone = completedChallenges.some(cc => cc.challenge_id === c.id);
                  return (
                    <View key={c.id} style={styles.planCard}>
                      <Text style={styles.planTitle}>🏆 {c.title}</Text>
                      <Text style={styles.planDesc}>{c.description}</Text>
                      <Text style={{color: Colors.gold, fontSize: 11, marginVertical: 6}}>Category: {c.category || 'Faith'}</Text>
                      {isDone ? (
                        <Text style={{color: '#27c93f', fontWeight: 'bold', fontSize: 13, marginTop: 5}}>✓ Completed 🎉</Text>
                      ) : (
                        <TouchableOpacity style={[styles.saveBtn, {paddingVertical: 8, marginTop: 5}]} onPress={() => handleCompleteChallenge(c.id)}>
                          <Text style={styles.saveBtnText}>Mark as Completed</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
                {challenges.length === 0 && <Text style={styles.empty}>No daily challenges for today.</Text>}

                <Text style={[styles.sectionLabel, {marginTop: 25}]}>MY COMPLETED CHALLENGES ({completedChallenges.length})</Text>
                {completedChallenges.map(cc => (
                  <View key={cc.id} style={styles.fastCard}>
                    <Text style={{color: Colors.text, fontWeight: 'bold'}}>🏆 {cc.title}</Text>
                    <Text style={{color: Colors.gold, fontSize: 11}}>Category: {cc.category} • Done on: {new Date(cc.completed_at).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* SCRIPTURE MEMORIZATION SECTION */}
            {activeSection === 'memorization' && (
              <View>
                <View style={styles.composeCard}>
                  <Text style={styles.composeTitle}>Add Verse to Memorize</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Scripture Verse (e.g. For God so loved...)" 
                    placeholderTextColor="#888"
                    multiline
                    value={memorizationForm.verse}
                    onChangeText={v => setMemorizationForm({...memorizationForm, verse: v})}
                  />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Reference (e.g. John 3:16)" 
                    placeholderTextColor="#888"
                    value={memorizationForm.reference}
                    onChangeText={v => setMemorizationForm({...memorizationForm, reference: v})}
                  />
                  <TouchableOpacity 
                    style={[styles.saveBtn, (!memorizationForm.verse.trim() || !memorizationForm.reference.trim()) && styles.saveBtnDisabled]}
                    onPress={handleAddMemorization}
                    disabled={!memorizationForm.verse.trim() || !memorizationForm.reference.trim()}
                  >
                    <Text style={styles.saveBtnText}>Save Scripture</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>MY SCRIPTURES TO MEMORIZE ({memorizations.length})</Text>
                {memorizations.map(m => (
                  <View key={m.id} style={styles.planCard}>
                    <Text style={{color: Colors.white, fontSize: 15, fontStyle: 'italic', lineHeight: 22}}>"{m.verse}"</Text>
                    <Text style={{color: Colors.gold, fontWeight: 'bold', fontSize: 13, marginTop: 5}}>— {m.reference}</Text>
                    
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10}}>
                      {m.mastered ? (
                        <Text style={{color: '#27c93f', fontWeight: 'bold', fontSize: 12}}>✓ Mastered 🎉</Text>
                      ) : (
                        <TouchableOpacity style={[styles.backBtnSmall, {backgroundColor: 'rgba(39,201,63,0.1)'}]} onPress={() => handleMasterMemorization(m.id)}>
                          <Text style={{color: '#27c93f', fontSize: 11, fontWeight: '700'}}>Mark as Mastered</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity style={[styles.backBtnSmall, {backgroundColor: 'rgba(255,59,48,0.1)'}]} onPress={() => handleDeleteMemorization(m.id)}>
                        <Text style={{color: Colors.error, fontSize: 11, fontWeight: '700'}}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* CHILD PROFILE REGISTRATION MODAL */}
        <Modal visible={showChildRegModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Register Child Profile</Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Child's Full Name" 
                placeholderTextColor={Colors.textDim}
                value={childForm.child_name}
                onChangeText={v => setChildForm({...childForm, child_name: v})}
              />

              <TextInput 
                style={styles.input} 
                placeholder="Date of Birth (e.g. YYYY-MM-DD)" 
                placeholderTextColor={Colors.textDim}
                value={childForm.dob}
                onChangeText={v => setChildForm({...childForm, dob: v})}
              />

              <TextInput 
                style={styles.input} 
                placeholder="Student Phone (Optional)" 
                placeholderTextColor={Colors.textDim}
                keyboardType="phone-pad"
                value={childForm.student_phone}
                onChangeText={v => setChildForm({...childForm, student_phone: v})}
              />

              <Text style={{color: Colors.gold, fontWeight: 'bold', fontSize: 12, marginTop: 10}}>Select Class / Grade:</Text>
              <ScrollView style={{maxHeight: 120}} nestedScrollEnabled={true}>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 10}}>
                  {CLASSES.map(cls => (
                    <TouchableOpacity 
                      key={cls} 
                      style={[styles.classBtn, childForm.class_name === cls && styles.classBtnActive]} 
                      onPress={() => setChildForm({...childForm, class_name: cls})}
                    >
                      <Text style={[styles.classText, childForm.class_name === cls && styles.classTextActive]}>{cls}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
                <TouchableOpacity style={[styles.saveBtn, {flex: 1, backgroundColor: 'rgba(255,255,255,0.1)'}]} onPress={() => setShowChildRegModal(false)}>
                  <Text style={[styles.saveBtnText, {color: Colors.text}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, {flex: 1}]} onPress={handleRegisterChild}>
                  <Text style={styles.saveBtnText}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, {flexDirection: 'row', alignItems: 'center', gap: 10}]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{t('church_menu')}</Text>
          <Text style={styles.subtitle}>{t('more_church_features')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {menuItems.map(item => (
          <TouchableOpacity 
            key={item.key} 
            style={styles.menuCard} 
            onPress={() => handleSectionSelect(item.key)}
            activeOpacity={0.85}
          >
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>{t('st_antony_church')}</Text>
          <Text style={styles.aboutText}>{t('faith_community_love')}</Text>
          <Text style={styles.aboutText}>Version 1.0.0 (Expo Platform)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuBtn: { padding: 4, marginRight: 8, alignSelf: 'center' },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  backBtnSmall: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.sm, marginBottom: 4 },
  backTextSmall: { color: Colors.textMuted, fontSize: 12 },
  
  list: { padding: Spacing.md },
  menuCard: { flexDirection: 'row', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between' },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  menuDesc: { fontSize: 12, color: Colors.textMuted },
  arrow: { fontSize: 18, color: Colors.gold, paddingLeft: 8 },
  
  aboutCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  aboutTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  aboutText: { fontSize: 12, color: Colors.textDim, marginBottom: 2 },
  
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionContainer: { padding: Spacing.md },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
  
  // Reading
  planCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  planDuration: { fontSize: 10, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  planTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  planDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  
  // Fasting
  composeCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  composeTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text, fontSize: 14, marginBottom: 10 },
  saveBtn: { backgroundColor: Colors.gold, paddingVertical: 12, borderRadius: Radius.sm, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.dark, fontSize: 14, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 1.2, marginBottom: 10 },
  fastCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10 },
  fastHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fastDate: { fontSize: 11, color: Colors.textDim, fontWeight: '600' },
  fastPurpose: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  fastNotes: { fontSize: 12, color: Colors.textMuted },
  
  // Services
  scheduleCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  scheduleDay: { fontSize: 15, fontWeight: '800', color: Colors.gold },
  scheduleTime: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  scheduleType: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  scheduleLocation: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  scheduleDesc: { fontSize: 13, color: Colors.textDim, lineHeight: 18 },
  
  // Podcasts
  podcastCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  podcastLang: { fontSize: 9, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, marginBottom: 4 },
  podcastTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  podcastPastor: { fontSize: 12, color: Colors.gold, fontWeight: '600', marginBottom: 6 },
  podcastDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },

  // Class Selection Grid
  classBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  classBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  classText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  classTextActive: { color: Colors.dark, fontWeight: '700' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalContainer: { width: '100%', backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.glassBorder },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.gold, marginBottom: 15 }
});
