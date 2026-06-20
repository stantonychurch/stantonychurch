import { Stack, useRouter, usePathname } from 'expo-router';
import { useState, createContext, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, useWindowDimensions, Platform, StatusBar, Modal, ActivityIndicator, Image } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPlatform } from '../../src/services/api';

export const DrawerContext = createContext(null);

export default function MemberLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const pathname = usePathname();

  // About Modal state
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [loadingAbout, setLoadingAbout] = useState(false);
  const [aboutInfo, setAboutInfo] = useState({ value: '', value_tamil: '' });
  const [priestInfo, setPriestInfo] = useState({ value: '', value_tamil: '' });

  // Get dynamic window dimensions
  const { width } = useWindowDimensions();
  const DRAWER_WIDTH = Math.round(width * 0.76);

  // Animations
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sync initial ref value if dimensions change before open
    if (!isOpen) {
      slideAnim.setValue(-DRAWER_WIDTH);
    }
  }, [DRAWER_WIDTH]);

  useEffect(() => {
    if (isOpen) {
      // Open Animations
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
      // Close Animations
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
  }, [isOpen, DRAWER_WIDTH]);

  const toggleDrawer = () => setIsOpen(prev => !prev);

  const fetchAboutInfo = async () => {
    setLoadingAbout(true);
    try {
      const res = await getPlatform('/church-info/about').catch(()=>({data:{}}));
      setAboutInfo({
        value: res.data?.info_value || 'No information available currently.',
        value_tamil: res.data?.info_value_tamil || 'தற்போது எந்த தகவலும் இல்லை.'
      });
      const res2 = await getPlatform('/church-info/priest').catch(()=>({data:{}}));
      setPriestInfo({
        value: res2.data?.info_value || '',
        value_tamil: res2.data?.info_value_tamil || ''
      });
    } catch(e){
      console.log("Error loading about info", e);
    } finally {
      setLoadingAbout(false);
    }
  };

  const navigateTo = async (path) => {
    setIsOpen(false);
    if (path === 'logout') {
      await logout();
      router.replace('/');
    } else if (path === 'about') {
      await fetchAboutInfo();
      setShowAboutModal(true);
    } else {
      router.push(path);
    }
  };

  const menuItems = [
    { label: lang === 'ta' ? 'திருச்சபை பற்றி' : 'About Church', icon: '⛪', path: 'about' },
    { label: lang === 'ta' ? 'அறிவிப்பு' : 'Announcement', icon: '📢', path: '/(member)/home' },
    { label: lang === 'ta' ? 'வேதாகம வாசிப்பு திட்டங்கள்' : 'Bible Reading Plans', icon: '📖', path: '/(member)/more?section=reading' },
    { label: lang === 'ta' ? 'குழந்தைகள் கதைகள்' : 'Children Stories', icon: '🧸', path: '/(member)/more?section=stories' },
    { label: lang === 'ta' ? 'தினசரி சவால்கள்' : 'Daily Challenges', icon: '🏆', path: '/(member)/more?section=challenges' },
    { label: lang === 'ta' ? 'நிகழ்வுகள்' : 'Events', icon: '📅', path: '/(member)/events' },
    { label: lang === 'ta' ? 'விசுவாச குறிப்பேடு' : 'Faith Journal', icon: '📝', path: '/(member)/journal' },
    { label: lang === 'ta' ? 'குடும்ப குழு' : 'Family Group', icon: '👨‍👩‍👧', path: '/(member)/family' },
    { label: lang === 'ta' ? 'புகைப்படத் தொகுப்புகள்' : 'Galleries', icon: '🖼️', path: '/(member)/galleries' },
    { label: lang === 'ta' ? 'முகப்பு' : 'Home', icon: '🏠', path: '/(member)/home' },
    { label: lang === 'ta' ? 'ஊழிய குழு' : 'Ministry Group', icon: '⛪', path: '/(member)/more?section=ministries' },
    { label: lang === 'ta' ? 'சான்றுகள்' : 'Praise Testimonies', icon: '🙌', path: '/(member)/more?section=testimonies' },
    { label: lang === 'ta' ? 'ஜெப நாட்காட்டி' : 'Prayer Calendar', icon: '📅', path: '/(member)/more?section=prayer_calendar' },
    { label: lang === 'ta' ? 'ஜெப சுவர்' : 'Prayer Wall', icon: '🙏', path: '/(member)/prayer' },
    { label: lang === 'ta' ? 'ஜெபங்கள் மற்றும் தியானங்கள்' : 'Prayers and Devotions', icon: '📿', path: '/(member)/devotional' },
    { label: lang === 'ta' ? 'வினாடி வினா' : 'Quiz', icon: '🧠', path: '/(member)/quiz' },
    { label: lang === 'ta' ? 'வசனம் மனப்பாடம்' : 'Scripture Memorization', icon: '💡', path: '/(member)/more?section=memorization' },
    { label: lang === 'ta' ? 'ஆராதனை நேரங்கள்' : 'Service Schedule', icon: '⏰', path: '/(member)/more?section=services' },
    { label: lang === 'ta' ? 'பாடல் கோரிக்கைகள்' : 'Song Request', icon: '🎵', path: '/(member)/more?section=song_requests' },
    { label: lang === 'ta' ? 'இன்றைய வசனம்' : 'Today Verse', icon: '📜', path: '/(member)/home' },
    { label: lang === 'ta' ? 'வீடியோக்கள் மற்றும் பிரசங்கங்கள்' : 'Videos and Sermons', icon: '🎬', path: '/(member)/videos' },
    { label: lang === 'ta' ? 'தன்னார்வ பணிகள்' : 'Volunteering and Duties', icon: '🤝', path: '/(member)/more?section=volunteering' },
    { label: lang === 'ta' ? 'வாராந்திர அறிவிப்புகள்' : 'Weekly Bulletins', icon: '📰', path: '/(member)/more?section=bulletins' },
    { label: lang === 'ta' ? 'ஆராதனை & காயர்' : 'Worship and Choir Sheets', icon: '🎼', path: '/(member)/more?section=playlists_choir' },
    { label: lang === 'ta' ? 'இளைஞர் குழு' : 'Youth Group', icon: '🔥', path: '/(member)/youth' }
  ];

  return (
    <DrawerContext.Provider value={{ toggleDrawer }}>
      <View style={{ flex: 1, backgroundColor: Colors.dark, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <Stack screenOptions={{ headerShown: false }} />

        {/* Drawer Overlay */}
        <Animated.View 
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[styles.overlay, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={toggleDrawer}
          />
        </Animated.View>

        {/* Drawer Menu */}
        <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient
            colors={['rgba(21, 28, 48, 0.97)', 'rgba(9, 13, 23, 0.99)']}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Header dots */}
          <View style={styles.headerRow}>
            <View style={styles.dotsRow}>
              <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
              <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
              <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
            </View>
            <TouchableOpacity onPress={toggleDrawer} style={styles.closeBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* App title */}
          <Text style={styles.appTitle}>St Antony Church</Text>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{user?.name || 'Member'}</Text>
              <Text style={styles.profileSub}>{t('my_account')}</Text>
            </View>
            <Text style={styles.profileChevron}>∨</Text>
          </View>

          <View style={styles.divider} />

          {/* Section Heading */}
          <Text style={styles.sectionHeading}>MENU</Text>

          <ScrollView contentContainerStyle={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  onPress={() => navigateTo(item.path)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={[styles.bottomBtn, { marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.05)' }]} 
              onPress={() => changeLanguage(lang === 'en' ? 'ta' : 'en')}
            >
              <Text style={styles.bottomBtnIcon}>🌐</Text>
              <Text style={styles.bottomBtnText}>{lang === 'en' ? 'தமிழ்' : 'English'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomBtn} onPress={() => navigateTo('logout')}>
              <Text style={styles.bottomBtnIcon}>⏻</Text>
              <Text style={[styles.bottomBtnText, { color: Colors.error }]}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* About Modal */}
        <Modal
          visible={showAboutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAboutModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('about')}</Text>
              
              {loadingAbout ? (
                <ActivityIndicator color={Colors.gold} style={{ marginVertical: 30 }} />
              ) : (
                <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Image 
                    source={require('../../assets/church_image.jpg')} 
                    style={styles.aboutChurchImage} 
                    resizeMode="cover"
                  />
                  
                  <Text style={styles.churchDescription}>
                    {lang === 'ta' ? aboutInfo.value_tamil : aboutInfo.value}
                  </Text>
                  
                    <View style={styles.priestCard}>
                      <Image 
                        source={require('../../assets/priest_image.jpeg')} 
                        style={styles.priestImageCircle} 
                        resizeMode="cover"
                      />
                      <View style={styles.priestDetails}>
                        <Text style={styles.priestTitle}>
                          {lang === 'ta' ? 'பங்குத் தந்தை' : 'Parish Priest'}
                        </Text>
                        <Text style={styles.priestName}>
                          {lang === 'ta' ? 'அருள்திரு பிலிப் எஸ்.' : 'Rev. Fr. Philip S'}
                        </Text>
                        <Text style={styles.priestAddress}>
                          {lang === 'ta' ? priestInfo.value_tamil : priestInfo.value}
                        </Text>
                      </View>
                    </View>
                  
                  <View style={styles.contactRow}>
                    <Text style={styles.contactHeader}>📍 {t('location')}</Text>
                    <Text style={styles.contactVal}>8W3P+JM7, near GH, Mahadevapuram, Mettupalayam, Tamil Nadu 641301</Text>
                  </View>
                  
                  <View style={styles.contactRow}>
                    <Text style={styles.contactHeader}>📞 {t('contact')}</Text>
                    <Text style={styles.contactVal}>+91 9952126090</Text>
                  </View>
                  
                  <Text style={styles.versionText}>v1.2.0 • Powered by parish community</Text>
                </ScrollView>
              )}
              
              <TouchableOpacity 
                style={styles.closeModalBtn} 
                onPress={() => setShowAboutModal(false)}
              >
                <Text style={styles.closeModalBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 9999,
  },
  overlayTouchable: {
    flex: 1,
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
  bottomActions: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  bottomBtnIcon: {
    fontSize: 18,
    width: 24,
    marginRight: 12,
    textAlign: 'center',
  },
  bottomBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // About Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#151c30',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalScroll: {
    paddingBottom: 15,
  },
  churchDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  patronCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.md,
  },
  patronTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  patronName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  patronInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    lineHeight: 18,
  },
  contactRow: {
    marginBottom: 10,
  },
  contactHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  contactVal: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 2,
  },
  versionText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 15,
  },
  closeModalBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  closeModalBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
  aboutChurchImage: {
    width: '100%',
    height: 220,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  priestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  priestImageCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  priestDetails: {
    flex: 1,
    marginLeft: 15,
  },
  priestTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  priestName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
    marginBottom: 4,
  },
  priestAddress: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },
});
