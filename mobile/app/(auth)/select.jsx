import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../src/config/theme';

export default function SelectPortal() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/jesus_child.jpg')}
            style={styles.selectImage}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>Choose Portal</Text>
        <Text style={styles.subtitle}>Select your role to login</Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(auth)/member-login')}
            activeOpacity={0.85}
          >
            <Text style={styles.cardIcon}>🙏</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Church Member</Text>
              <Text style={styles.cardDesc}>Access sermons, devotionals, events and your personal history</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.adminCard]}
            onPress={() => router.push('/(auth)/admin-login')}
            activeOpacity={0.85}
          >
            <Text style={styles.cardIcon}>⚙️</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Church Admin</Text>
              <Text style={styles.cardDesc}>Manage videos, audio, events, and Bible verses for the congregation</Text>
            </View>
            <Text style={[styles.cardArrow, { color: '#7c4dff' }]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.full },
  backText: { color: Colors.textMuted, fontSize: 14 },
  content: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  imageContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  selectImage: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: Colors.gold },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
  cards: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  adminCard: { borderColor: 'rgba(124,77,255,0.3)' },
  cardIcon: { fontSize: 32 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  cardArrow: { fontSize: 18, color: Colors.gold, fontWeight: '700' },
});
