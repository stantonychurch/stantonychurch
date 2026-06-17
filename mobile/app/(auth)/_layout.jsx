import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select" />
      <Stack.Screen name="member-login" />
      <Stack.Screen name="admin-login" />
    </Stack>
  );
}
