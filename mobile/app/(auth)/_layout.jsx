import { Stack } from 'expo-router';
import { View, Platform, StatusBar } from 'react-native';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#090d17' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="select" />
        <Stack.Screen name="member-login" />
        <Stack.Screen name="admin-login" />
      </Stack>
    </View>
  );
}
