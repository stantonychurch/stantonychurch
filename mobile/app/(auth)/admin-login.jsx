import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { adminLogin } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!form.name || !form.password) return setError('Name and password are required.');
    setError(''); setLoading(true);
    try {
      const res = await adminLogin(form);
      await login(res.data);
      router.replace('/(admin)/dashboard');
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.icon}>⚙️</Text>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Manage your church's content</Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.field}>
            <Text style={styles.label}>Admin Name</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput style={styles.input} placeholder="Enter admin name" placeholderTextColor="#999"
                value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput style={styles.input} placeholder="Enter admin password" placeholderTextColor="#999"
                value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} secureTextEntry />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleLogin} disabled={loading}
          >
            {loading ? <ActivityIndicator color={Colors.white} /> :
              <Text style={styles.submitText}>Login as Admin</Text>}
          </TouchableOpacity>

          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0715' },
  container: { padding: Spacing.lg, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.full, marginBottom: Spacing.lg },
  backText: { color: Colors.textMuted, fontSize: 14 },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg },
  errorBox: { backgroundColor: 'rgba(231,76,60,0.12)', borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)', borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  errorText: { color: Colors.error, fontSize: 13 },
  field: { marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)', borderRadius: Radius.sm, paddingHorizontal: 12 },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, color: Colors.text, fontSize: 15 },
  submitBtn: { backgroundColor: Colors.adminAccent, paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md, shadowColor: Colors.adminAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 12, color: Colors.textDim, marginTop: Spacing.md },
  code: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#a78bfa', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});
