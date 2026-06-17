import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Animated, Alert, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing } from '../../../src/config/theme';
import apiClient from '../../../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../../src/context/LanguageContext';

export default function PrayerRoomScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [isActive, setIsActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(0);
  
  // App state listener to handle backgrounding
  const appState = useRef(AppState.currentState);

  // Animation for the candle burn down (1 to 0 over 30 mins)
  // But we start at whatever the current_candle_minutes is
  const candleHeightAnim = useRef(new Animated.Value(1)).current;
  const flameFlicker = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadCandleState();
    
    // Flame flickering effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameFlicker, { toValue: 0.7, duration: 100, useNativeDriver: true }),
        Animated.timing(flameFlicker, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(flameFlicker, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(flameFlicker, { toValue: 1, duration: 100, useNativeDriver: true })
      ])
    ).start();

  }, []);

  async function loadCandleState() {
    try {
      const res = await apiClient.get(`/platform/family/${id}/candle`);
      const current = res.data.stats?.current_candle_minutes || 0;
      setInitialMinutes(current);
      
      // Calculate remaining ratio (e.g. 10 mins played = 20 mins remaining = 0.66 height)
      const ratio = Math.max(0, (30 - current) / 30);
      candleHeightAnim.setValue(ratio);

    } catch (e) {
      Alert.alert('Error', 'Failed to load candle state');
      router.back();
    }
  }

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsElapsed(sec => {
          const newSec = sec + 1;
          const totalMins = initialMinutes + (newSec / 60);
          
          // Update visual candle height smoothly
          const ratio = Math.max(0, (30 - totalMins) / 30);
          Animated.timing(candleHeightAnim, {
            toValue: ratio,
            duration: 1000,
            useNativeDriver: false // height cannot use native driver
          }).start();

          if (totalMins >= 30) {
            handleComplete();
          }
          return newSec;
        });
      }, 1000);
    } else if (!isActive && secondsElapsed !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsElapsed, initialMinutes]);

  const saveProgress = async () => {
    const minsToSave = Math.floor(secondsElapsed / 60);
    if (minsToSave > 0) {
      try {
        await apiClient.post(`/platform/family/${id}/candle/burn`, { minutes: minsToSave });
      } catch (e) {
        console.log('Failed to save progress', e);
      }
    }
  };

  const handleComplete = async () => {
    setIsActive(false);
    await saveProgress();
    setSecondsElapsed(0);
    Alert.alert('🔥 Candle Completed!', 'Your family has completed a prayer candle! God bless your family.', [
      { text: 'Finish', onPress: () => router.back() }
    ]);
  };

  const handleExit = async () => {
    setIsActive(false);
    if (secondsElapsed >= 60) {
      await saveProgress();
      Alert.alert('Saved', `You prayed for ${Math.floor(secondsElapsed / 60)} minutes. Progress saved!`, [
        { text: 'Leave', onPress: () => router.back() }
      ]);
    } else {
      // Less than 1 min, don't bother saving
      router.back();
    }
  };

  const currentTotalMins = initialMinutes + (secondsElapsed / 60);
  const remainingMins = Math.max(0, 30 - currentTotalMins);
  
  const m = Math.floor(remainingMins);
  const s = Math.floor((remainingMins - m) * 60);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0a0806', '#1a140f', '#000000']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t('exit_room') || 'Exit Room'}</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')} {t('remaining') || 'Remaining'}</Text>
      </View>

      {/* Mary Full Screen Background */}
      <View style={[StyleSheet.absoluteFill, {justifyContent: 'center', alignItems: 'center', zIndex: 1}]}>
        <Image 
          source={require('../../../assets/mary.png')} 
          style={{width: '100%', height: '100%', opacity: isActive ? 1 : 0.6}} 
          resizeMode="cover" 
        />
        <View style={styles.glowBg} />
      </View>

      <View style={styles.roomCenter}>
        
        {/* Left Candle */}
        <View style={[styles.candleContainer, {marginRight: 60}]}>
           <Animated.View style={[styles.flame, { transform: [{scale: flameFlicker}] }]} />
           <Animated.View style={[
             styles.wax, 
             { height: candleHeightAnim.interpolate({ inputRange: [0, 1], outputRange: ['10%', '100%'] }) }
           ]} />
        </View>

        {/* Right Candle */}
        <View style={[styles.candleContainer, {marginLeft: 60}]}>
           <Animated.View style={[styles.flame, { transform: [{scale: flameFlicker}] }]} />
           <Animated.View style={[
             styles.wax, 
             { height: candleHeightAnim.interpolate({ inputRange: [0, 1], outputRange: ['10%', '100%'] }) }
           ]} />
        </View>

      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.mainBtn, { backgroundColor: isActive ? '#e74c3c' : Colors.gold }]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={[styles.mainBtnText, { color: isActive ? '#fff' : '#000' }]}>
            {isActive ? (t('pause_prayer') || 'Pause Prayer') : (t('start_prayer_session') || 'Start Prayer Session')}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.instruction}>
          {t('prayer_room_instruction') || 'Keep this screen open while your family prays. The candle will burn for 30 minutes.'}
        </Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: 40, zIndex: 10 },
  backBtnText: { color: Colors.textMuted, fontSize: 16 },
  timerText: { color: Colors.gold, fontSize: 24, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  
  roomCenter: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 60, zIndex: 5 },
  
  glowBg: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(255, 215, 0, 0.05)', zIndex: 2 },

  candleContainer: { width: 30, height: 200, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 10 },
  wax: { width: 24, backgroundColor: '#fdfbf7', borderRadius: 4, shadowColor: '#fff', shadowOffset: {width:0, height:0}, shadowOpacity: 0.5, shadowRadius: 10 },
  flame: { width: 14, height: 24, backgroundColor: '#ff9d00', borderRadius: 10, marginBottom: 2, shadowColor: '#ffaa00', shadowOffset: {width:0, height:0}, shadowOpacity: 1, shadowRadius: 15, elevation: 5 },

  controls: { padding: Spacing.xl, alignItems: 'center', paddingBottom: 50 },
  mainBtn: { width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', shadowColor: Colors.gold, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  mainBtnText: { fontSize: 18, fontWeight: 'bold' },
  instruction: { color: Colors.textDim, textAlign: 'center', marginTop: 20, fontSize: 13, lineHeight: 20 }
});
