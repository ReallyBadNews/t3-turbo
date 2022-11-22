import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import type { EmitterSubscription, KeyboardEventListener } from "react-native";
import {
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@badnews/api";

import { trpc } from "../utils/trpc";

const PostCard: FC<{
  post: inferProcedureOutput<AppRouter["post"]["all"]>[number];
}> = ({ post }) => {
  return (
    <View className="rounded-lg border-2 border-gray-500 p-4">
      <Text className="text-xl font-semibold text-[#cc66ff]">{post.title}</Text>
      <Text className="text-white">{post.description}</Text>
    </View>
  );
};

const CreatePost: FC = () => {
  const utils = trpc.useContext();
  const { mutate } = trpc.post.create.useMutation({
    async onSuccess() {
      await utils.post.all.invalidate();
    },
  });

  const [url, onChangeURL] = useState("");
  const [title, onChangeTitle] = useState("");
  const [description, onChangeDescription] = useState("");

  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const onKeyboardShow: KeyboardEventListener = (event) => {
    return setKeyboardOffset(event.endCoordinates.height);
  };
  const onKeyboardHide = () => setKeyboardOffset(0);
  const keyboardDidShowListener = useRef<EmitterSubscription>();
  const keyboardDidHideListener = useRef<EmitterSubscription>();

  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener(
      "keyboardWillShow",
      onKeyboardShow
    );
    keyboardDidHideListener.current = Keyboard.addListener(
      "keyboardWillHide",
      onKeyboardHide
    );

    return () => {
      keyboardDidShowListener.current?.remove();
      keyboardDidHideListener.current?.remove();
    };
  }, []);

  return (
    <View
      className="flex flex-col border-t-2 border-gray-500 p-4"
      style={{ marginBottom: keyboardOffset }}
    >
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeURL}
        placeholder="URL"
      />
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeTitle}
        placeholder="Title"
      />
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeDescription}
        placeholder="Description"
      />
      <TouchableOpacity
        className="rounded bg-[#cc66ff] p-2"
        onPress={() => {
          mutate({
            title,
            description,
            url,
          });
        }}
      >
        <Text className="font-semibold text-white">Publish post</Text>
      </TouchableOpacity>
    </View>
  );
};

export const HomeScreen = () => {
  const postQuery = trpc.post.all.useQuery();
  const [showPost, setShowPost] = useState<string | null>(null);

  return (
    <SafeAreaView className="bg-[#2e026d] bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <View className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-5xl font-bold text-white">
          {`Turbo `}
          <Text className="text-[#cc66ff]">Repo</Text>
        </Text>

        <View className="py-2">
          {showPost ? (
            <Text className="text-white">
              <Text className="font-semibold">Selected post:</Text>
              {showPost}
            </Text>
          ) : (
            <Text className="font-semibold italic text-white">
              Press on a post
            </Text>
          )}
        </View>

        <FlashList
          data={postQuery.data}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <TouchableOpacity onPress={() => setShowPost(p.item.id)}>
              <PostCard post={p.item} />
            </TouchableOpacity>
          )}
        />

        <CreatePost />
      </View>
    </SafeAreaView>
  );
};
