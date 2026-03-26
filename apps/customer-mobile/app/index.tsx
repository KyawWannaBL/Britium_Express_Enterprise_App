import { Text, TextInput, View } from "react-native";
import { getDictionary } from "@britium/shared";

const dictionary = getDictionary("my");

export default function CustomerHomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        backgroundColor: "#ffffff"
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
        {dictionary.customer.heroTitle}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>
        {dictionary.customer.heroSubtitle}
      </Text>
      <TextInput
        placeholder={dictionary.customer.enterTracking}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14
        }}
      />
    </View>
  );
}
