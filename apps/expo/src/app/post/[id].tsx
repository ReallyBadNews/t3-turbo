import { SplashScreen, Stack, useSearchParams } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

import { api } from "../../utils/api";

const Post: React.FC = () => {
  const { id } = useSearchParams();
  if (!id || typeof id !== "string") throw new Error("unreachable");
  const { data } = api.pin.byId.useQuery(id);

  if (!data) return <SplashScreen />;

  return (
    <SafeAreaView className="bg-[#1F104A]">
      {data.description && (
        <Stack.Screen options={{ title: data.description }} />
      )}
      <View className="h-full w-full p-4">
        {data.user?.displayName && (
          <Text className="py-2 text-3xl font-bold text-white">
            {data.user.displayName}
          </Text>
        )}
        <Text className="py-4 text-white">{data.description}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Post;
