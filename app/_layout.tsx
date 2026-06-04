import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text} from "react-native";

export default function RootLayout() {
  
  const insets = useSafeAreaInsets(); // Accounts for notches/status bars
  return (
    <Stack screenOptions={{
        header: () => (
            <View style={{ height: 10 + insets.top, paddingTop: insets.top, backgroundColor: "#48D0B0" }}>
              {/* <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>My Taller Header</Text> */}
            </View>
          ),
        }}>
      
      <Stack.Screen name="index"/>
    </Stack>
  );
}