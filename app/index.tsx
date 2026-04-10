import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { loading, configured, session } = useAuth();
  const [forceResolve, setForceResolve] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceResolve(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (loading && !forceResolve) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)" />;
}
