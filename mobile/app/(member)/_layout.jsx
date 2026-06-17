import { Stack, useRouter, usePathname } from 'expo-router';
import { useState, createContext, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

export const DrawerContext = createContext(null);

export default function MemberLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const pathname = usePathname();

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

  const navigateTo = async (path) => {
    setIsOpen(false);
    if (path === 'logout') {
      await logout();
      router.replace('/');
    } else {
      router.push(path);
    }
  };

  const menuItems = [
    { label: t('home'), icon: '🏠', path: '/(member)/home' },
    { label: t('devotionals'), icon: '📖', path: '/(member)/devotional' },
    { label: t('prayer_requests'), icon: '🙏', path: '/(member)/prayer' },
    { label: t('events'), icon: '📅', path: '/(member)/events' },
    { label: t('family_group'), icon: '👨‍👩‍👧', path: '/(member)/family' },
    { label: t('youth_group'), icon: '🔥', path: '/(member)/youth' },
    { label: t('worship_songs'), icon: '🎵', path: '/(member)/worship' },
    { label: t('faith_journal'), icon: '📝', path: '/(member)/journal' },
    { label: t('galleries'), icon: '🖼️', path: '/(member)/galleries' },
    { label: t('videos_sermons'), icon: '🎬', path: '/(member)/videos' },
    { label: t('quiz'), icon: '🧠', path: '/(member)/quiz' },
    { label: t('church_menu'), icon: '☰', path: '/(member)/more' },
  ];

  return (
    <DrawerContext.Provider value={{ toggleDrawer }}>
      <View style={{ flex: 1, backgroundColor: Colors.dark }}>
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
});
