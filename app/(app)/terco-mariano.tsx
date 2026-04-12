import { RosaryPrayerScreen } from '@/components/rosary/RosaryPrayerScreen';

export const options = { title: 'Terço Mariano', headerShown: false };

export default function TercoMarianoScreen() {
  return <RosaryPrayerScreen mode="daily" />;
}
