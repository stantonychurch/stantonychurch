import { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Colors, Spacing, Radius } from '../src/config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVerseOfDay } from '../src/services/api';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [showAnimation, setShowAnimation] = useState(false);
  const [todayVerse, setTodayVerse] = useState(null);
  const [typedVerse, setTypedVerse] = useState('');
  const [showButton, setShowButton] = useState(false);

  // Animated values
  const textOpacity = useRef(new Animated.Value(0)).current;
  const doorOpenOpacity = useRef(new Animated.Value(0)).current;
  
  const doveFrontOpacity = useRef(new Animated.Value(0)).current;
  const doveFrontScale = useRef(new Animated.Value(0.1)).current;
  const doveFrontY = useRef(new Animated.Value(-height * 0.1)).current;
  
  const doveBackOpacity = useRef(new Animated.Value(0)).current;
  const doveBackScale = useRef(new Animated.Value(1)).current;
  const doveBackY = useRef(new Animated.Value(height * 0.15)).current;
  
  const scrollOpacity = useRef(new Animated.Value(0)).current;
  const scrollScale = useRef(new Animated.Value(0.8)).current;
  
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    async function checkAuthAndAnimation() {
      if (loading) return;

      if (user) {
        if (user.role === 'admin') {
          router.replace('/(admin)/dashboard');
          return;
        }

        try {
          const today = new Date().toISOString().split('T')[0];
          const lastSeen = await AsyncStorage.getItem('last_heaven_msg_date');

          if (lastSeen === today) {
            router.replace('/(member)/home');
          } else {
            // Fetch random verse for the animation
            const vRes = await getVerseOfDay();
            if (vRes.data && vRes.data.verse) {
              setTodayVerse(vRes.data);
            }
            setShowAnimation(true);
          }
        } catch (err) {
          console.log('Error verifying animation rules:', err);
          router.replace('/(member)/home');
        }
      }
    }

    checkAuthAndAnimation();
  }, [user, loading]);

  useEffect(() => {
    if (!showAnimation) return;

    // SCENE TIMINGS
    Animated.sequence([
      // 0 - 1.5s: Intro text fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
      
      // 1.5s - 3s: Heaven Door opens (fades from closed to open image)
      Animated.timing(doorOpenOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
      
      // 3s - 5.5s: Dove comes out
      Animated.parallel([
        Animated.timing(doveFrontOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(doveFrontScale, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(doveFrontY, { toValue: height * 0.15, duration: 2500, useNativeDriver: true })
      ]),
      
      // 5.5s - 6.5s: Scroll Appears
      Animated.parallel([
        Animated.timing(scrollOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(scrollScale, { toValue: 1, friction: 5, useNativeDriver: true })
      ]),
      
      // 6.5s - 11s: Wait for typewriter to type verse (4.5s delay)
      Animated.delay(4500),

      // 11s - 11.5s: Dove turns around (fade front out, fade back in)
      Animated.parallel([
        Animated.timing(doveFrontOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(doveBackOpacity, { toValue: 1, duration: 500, useNativeDriver: true })
      ]),

      // 11.5s - 14s: Dove returns back into heaven
      Animated.parallel([
        Animated.timing(doveBackScale, { toValue: 0.1, duration: 2500, useNativeDriver: true }),
        Animated.timing(doveBackY, { toValue: -height * 0.1, duration: 2500, useNativeDriver: true })
      ]),

      // 14s - 15.5s: Heaven Door closes
      Animated.timing(doorOpenOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),

      // 15.5s - 16.5s: Enter Church Button Appears
      Animated.timing(textOpacity, { toValue: 0, duration: 500, useNativeDriver: true }), // Fade out intro text
    ]).start(() => {
      setShowButton(true);
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true })
      ]).start();
    });
  }, [showAnimation]);

  // Typewriter effect controller
  useEffect(() => {
    if (showAnimation && todayVerse && scrollOpacity) {
      const scrollListener = scrollOpacity.addListener(({ value }) => {
        if (value > 0.8 && typedVerse === '') {
          scrollOpacity.removeListener(scrollListener);
          const verseText = user?.language === 'ta' && todayVerse.verse_tamil ? todayVerse.verse_tamil : todayVerse.verse;
          const fullString = `"${verseText}"\n\n— ${todayVerse.reference}`;
          let cursor = 0;
          const charTimer = setInterval(() => {
            setTypedVerse(fullString.substring(0, cursor + 1));
            cursor++;
            if (cursor >= fullString.length) {
              clearInterval(charTimer);
            }
          }, 35);
        }
      });
      return () => scrollOpacity.removeListener(scrollListener);
    }
  }, [showAnimation, todayVerse, scrollOpacity, typedVerse]);

  const completeAnimation = async () => {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem('last_heaven_msg_date', today);
    router.replace('/(member)/home');
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.gold} /></View>;

  // --- ANIMATED DOVE SCREEN ---
  if (showAnimation) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0a0806', '#1a140f', '#000000']} style={StyleSheet.absoluteFill} />
        
        {/* Intro Text */}
        <Animated.View style={[styles.introTextContainer, { opacity: textOpacity }]}>
          <Text style={styles.introSubtitle}>ST ANTONY DEVOTIONAL</Text>
          <Text style={styles.introTitle}>A message from Heaven...</Text>
        </Animated.View>

        {/* Heaven Doors */}
        <View style={styles.doorContainer}>
          <Animated.Image 
            source={require('../assets/heaven_door_closed.png')}
            style={styles.doorImage}
            resizeMode="cover"
          />
          <Animated.Image 
            source={require('../assets/heaven_door_open.png')}
            style={[styles.doorImage, styles.doorOverlay, { opacity: doorOpenOpacity }]}
            resizeMode="cover"
          />
        </View>

        {/* Realistic Dove Front (Flying Towards) */}
        <Animated.Image 
          source={require('../assets/realistic_dove_nobg.png')}
          style={[styles.doveImage, {
            opacity: doveFrontOpacity,
            transform: [
              { translateY: doveFrontY },
              { scale: doveFrontScale }
            ]
          }]}
          resizeMode="contain"
        />

        {/* Realistic Dove Back (Flying Away) */}
        <Animated.Image 
          source={require('../assets/dove_back_nobg.png')}
          style={[styles.doveImage, {
            opacity: doveBackOpacity,
            transform: [
              { translateY: doveBackY },
              { scale: doveBackScale }
            ]
          }]}
          resizeMode="contain"
        />

        {/* The Scroll */}
        <Animated.View style={[styles.scrollContainer, { opacity: scrollOpacity, transform: [{ scale: scrollScale }] }]}>
          <LinearGradient colors={['#fdfbf7', '#f4e9d8']} style={StyleSheet.absoluteFill} />
          <Text style={styles.scrollHeader}>DAILY VERSE</Text>
          <Text style={styles.scrollVerseText}>{typedVerse}</Text>
        </Animated.View>

        {/* Enter Button */}
        {showButton && (
          <Animated.View style={[styles.btnContainer, { opacity: btnOpacity, transform: [{ scale: btnScale }] }]}>
            <TouchableOpacity style={styles.enterChurchButton} onPress={completeAnimation} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.enterBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.enterBtnText}>Enter the Church ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={completeAnimation} style={{ marginTop: 15 }}>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Skip to Dashboard</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  }

  // --- STANDARD VISITOR FALLBACK LANDING SCREEN (If NOT logged in) ---
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1209', '#0d0a06', '#241a0d']} style={StyleSheet.absoluteFill} />

      <View style={styles.imageContainer}>
        <Image source={require('../assets/welcome_img.jpg')} style={styles.welcomeImage} resizeMode="cover" />
      </View>

      <View style={styles.content}>
        <View style={styles.badge}><Text style={styles.badgeText}>ST ANTONY CHURCH</Text></View>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Experience God's love and grace. Join us in worship, community support,
          and service as we walk this spiritual journey together.
        </Text>

        <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/(auth)/select')} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Enter the Church →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0d0a06', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#0d0a06' },
  
  // Animation Styles
  introTextContainer: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  introSubtitle: { fontSize: 12, fontWeight: '800', color: Colors.gold, letterSpacing: 2, marginBottom: 8 },
  introTitle: { fontSize: 22, color: Colors.white, fontWeight: '600', fontStyle: 'italic', letterSpacing: 1 },
  
  doorContainer: { position: 'absolute', top: height * 0.1, width: width, height: height * 0.45, zIndex: 1, justifyContent: 'center', alignItems: 'center' },
  doorImage: { width: '100%', height: '100%' },
  doorOverlay: { position: 'absolute', top: 0, left: 0 },
  
  doveImage: { position: 'absolute', width: width * 0.8, height: width * 0.8, zIndex: 5, alignSelf: 'center', top: 0 },
  
  scrollContainer: { position: 'absolute', top: height * 0.55, alignSelf: 'center', width: width * 0.85, minHeight: 140, borderRadius: 12, borderWidth: 2, borderColor: '#d7c7a7', padding: Spacing.lg, zIndex: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  scrollHeader: { fontSize: 12, fontWeight: '800', color: '#8b6914', letterSpacing: 2, marginBottom: 12 },
  scrollVerseText: { fontSize: 16, color: '#422a16', fontStyle: 'italic', textAlign: 'center', lineHeight: 26, fontWeight: '600' },
  
  btnContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  enterChurchButton: { width: width * 0.76, height: 55, borderRadius: 30, overflow: 'hidden', shadowColor: Colors.gold, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  enterBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  enterBtnText: { color: Colors.dark, fontWeight: 'bold', fontSize: 15, letterSpacing: 1.2 },

  // Standard fallback styles
  imageContainer: { height: height * 0.42, justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  welcomeImage: { width: width * 0.65, height: height * 0.35, borderRadius: Radius.md },
  content: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: Spacing.lg, paddingBottom: 80 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#fff0ef', borderWidth: 1, borderColor: 'rgba(255,126,115,0.3)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, marginBottom: Spacing.sm },
  badgeText: { fontSize: 10, fontWeight: '700', color: Colors.pink, letterSpacing: 1.5 },
  title: { fontSize: 36, fontWeight: '800', color: '#1a1a1a', marginBottom: Spacing.sm },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: Spacing.md },
  continueBtn: { backgroundColor: Colors.pink, paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: 'auto' },
  continueBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
