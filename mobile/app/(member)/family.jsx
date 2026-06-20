import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { getPlatform, postPlatform } from '../../src/services/api';
import { DrawerContext } from './_layout';
import { useLanguage } from '../../src/context/LanguageContext';

export default function FamilyScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t } = useLanguage();
  const router = useRouter();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familyName, setFamilyName] = useState('');
  const [qrCodeId, setQrCodeId] = useState('');

  useEffect(() => {
    loadFamilies();
  }, []);

  async function loadFamilies() {
    try {
      setLoading(true);
      const res = await getPlatform('/family/my');
      setFamilies(res.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function createFamily() {
    if (!familyName.trim()) return Alert.alert(t('error'), t('enter_family_name'));
    try {
      const res = await postPlatform('/family/create', { family_name: familyName });
      Alert.alert(t('success'), t('family_created') + res.data.qr_code_id);
      setFamilyName('');
      loadFamilies();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function joinFamily() {
    if (!qrCodeId.trim()) return Alert.alert(t('error'), t('enter_invite_code'));
    try {
      await postPlatform('/family/join', { qr_code_id: qrCodeId });
      Alert.alert(t('success'), t('joined_family'));
      setQrCodeId('');
      loadFamilies();
    } catch (e) {
      Alert.alert(t('error'), e.response?.data?.error || e.message);
    }
  }

  async function leaveFamily(id) {
    Alert.alert(
      t('confirm') || 'Confirm',
      t('leave_family_confirm') || 'Are you sure you want to leave this family group?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { text: t('delete') || 'Delete', style: 'destructive', onPress: async () => {
            try {
              // Assume apiClient has an api.deletePlatform but we will just use delete directly via fetch or api handler
              // We'll import api from '../../src/services/api'
              const api = require('../../src/services/api').default;
              await api.delete(`/platform/family/${id}/leave`);
              loadFamilies();
            } catch (e) {
              Alert.alert(t('error'), e.response?.data?.error || e.message);
            }
        }}
      ]
    );
  }

  if (loading) {
    return <SafeAreaView style={styles.safe}><Text style={styles.loading}>{t('loading')}</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: Colors.gold, fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}><View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('family_connection')}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('my_family_groups')}</Text>
          {families.length === 0 ? <Text style={styles.empty}>{t('not_in_family_groups')}</Text> : null}
          {families.map(f => (
            <TouchableOpacity key={f.id} style={styles.card} onPress={() => router.push(`/(member)/family/${f.id}`)}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{flex: 1}}>
                  <Text style={styles.cardTitle}>{f.family_name}</Text>
                  <Text style={styles.cardCode}>{t('invite_code')} {f.qr_code_id}</Text>
                </View>
                <TouchableOpacity onPress={() => leaveFamily(f.id)} style={{padding: 5, marginRight: 15, backgroundColor: 'rgba(231, 76, 60, 0.1)', borderRadius: 5, paddingHorizontal: 10}}>
                  <Text style={{color: Colors.error, fontSize: 12, fontWeight: 'bold'}}>{t('delete') || 'Leave'}</Text>
                </TouchableOpacity>
                <Text style={{color: Colors.gold}}>{t('enter_arrow')}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('create_family_group')}</Text>
          <TextInput 
            style={styles.input} 
            placeholder={t('family_name_placeholder')} 
            placeholderTextColor={Colors.textMuted}
            value={familyName}
            onChangeText={setFamilyName}
          />
          <TouchableOpacity style={styles.btn} onPress={createFamily}>
            <Text style={styles.btnText}>{t('create_group')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('join_family_group')}</Text>
          <TextInput 
            style={styles.input} 
            placeholder={t('invite_code_placeholder')} 
            placeholderTextColor={Colors.textMuted}
            value={qrCodeId}
            onChangeText={setQrCodeId}
          />
          <TouchableOpacity style={styles.btnAlt} onPress={joinFamily}>
            <Text style={styles.btnText}>{t('join_group')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  menuBtn: { padding: 4, marginRight: 2 },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  headerTitle: { fontSize: 18, color: Colors.text, fontWeight: '700' },
  scroll: { padding: Spacing.md },
  loading: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  empty: { color: Colors.textMuted, marginTop: 10, fontStyle: 'italic' },
  section: { backgroundColor: Colors.darkCard, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.glassBorder },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.gold, marginBottom: Spacing.sm },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: Spacing.md, borderRadius: Radius.sm, marginTop: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  cardCode: { fontSize: 12, color: Colors.textMuted, marginTop: 4, fontFamily: 'monospace' },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', color: Colors.text, padding: 12, borderRadius: Radius.sm, marginBottom: 10 },
  btn: { backgroundColor: Colors.gold, padding: 12, borderRadius: Radius.sm, alignItems: 'center' },
  btnAlt: { backgroundColor: 'rgba(200,153,26,0.2)', borderWidth: 1, borderColor: Colors.gold, padding: 12, borderRadius: Radius.sm, alignItems: 'center' },
  btnText: { color: Colors.dark, fontWeight: 'bold' }
});
