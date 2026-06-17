import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { memberLogin, memberRegister } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';

export default function MemberLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', dob: '' });
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleLogin() {
    if (!form.name || !form.phone || !form.password) return setError('All fields are required.');
    setError(''); setLoading(true);
    try {
      const res = await memberLogin({ name: form.name, phone: form.phone, password: form.password });
      await login(res.data);
      router.replace('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  }

  async function handleRegister() {
    if (!form.name || !form.phone || !form.password) return setError('Name, phone, and password are required.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setError(''); setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone, password: form.password };
      if (form.dob) payload.dob = form.dob;
      const res = await memberRegister(payload);
      await login(res.data);
      router.replace('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={tab === 'login' ? require('../../assets/st_antony_emblem.jpg') : require('../../assets/st_antony_emblem.jpg')}
              style={tab === 'login' ? styles.loginEmblem : styles.loginEmblem}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.title}>{tab === 'login' ? 'Sign In' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>{tab === 'login' ? 'Login to your account' : 'Join St Antony Church'}</Text>

          {/* Tab switcher */}
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, tab === 'login' && styles.tabActive]} onPress={() => { setTab('login'); setError(''); }}>
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'register' && styles.tabActive]} onPress={() => { setTab('register'); setError(''); }}>
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {/* Fields */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#999"
                value={form.name} onChangeText={v => set('name', v)} autoCapitalize="words" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput style={styles.input} placeholder="Enter your phone number" placeholderTextColor="#999"
                value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput style={styles.input} placeholder={tab === 'login' ? 'Enter your password' : 'Create a password (min 6 chars)'}
                placeholderTextColor="#999" value={form.password} onChangeText={v => set('password', v)}
                secureTextEntry />
            </View>
          </View>

          {tab === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Date of Birth <Text style={styles.optional}>(optional)</Text></Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>🎂</Text>
                <TextInput style={styles.input} placeholder="YYYY-MM-DD  e.g. 1995-12-25"
                  placeholderTextColor="#999" value={form.dob} onChangeText={v => set('dob', v)} />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={tab === 'login' ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={Colors.white} /> :
              <Text style={styles.submitText}>{tab === 'login' ? 'Login' : 'Create Account'}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  container: { padding: Spacing.lg, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.full, marginBottom: Spacing.lg },
  backText: { color: Colors.textMuted, fontSize: 14 },
  imageContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  loginEmblem: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: Colors.gold },
  registerStatue: { width: '100%', height: 180, borderRadius: Radius.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.full, padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.full, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.pink },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.white },
  errorBox: { backgroundColor: 'rgba(231,76,60,0.12)', borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)', borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  errorText: { color: Colors.error, fontSize: 13 },
  field: { marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 6 },
  optional: { fontSize: 11, color: Colors.textDim, fontWeight: '400' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.sm, paddingHorizontal: 12 },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, color: Colors.text, fontSize: 15 },
  submitBtn: { backgroundColor: Colors.pink, paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md, shadowColor: Colors.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
