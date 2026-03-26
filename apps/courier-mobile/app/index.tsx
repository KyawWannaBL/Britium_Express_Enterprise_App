import { Text, View } from "react-native";
import { getDictionary } from "@britium/shared";

const dictionary = getDictionary("en");

export default function CourierHomeScreen() {
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
        {dictionary.courier.myJobs}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 12 }}>
        {dictionary.courier.scanWaybill}
      </Text>
      <Text style={{ fontSize: 16 }}>
        {dictionary.courier.completeDelivery}
      </Text>
    </View>
  );
}
