import {
  Avatar,
  AvatarBadge,
  Box,
  Flex,
  Image,
  Stack,
  Text,
  WrapItem,
  useColorMode,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";

const Conversation = ({ conversation, isOnline }) => {
  const { colorMode } = useColorMode();
  const currentUser = useRecoilValue(userAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  // console.log("selectedConversation", selectedConversation);
  if (
    !conversation ||
    !conversation.participants ||
    conversation.participants.length === 0
  ) {
    return null;
  }
  const user = conversation.participants[0];
  const lastMessage = conversation.lastMessage;

  if (!user) {
    return null;
  }

  return (
    <Flex
      gap={4}
      alignItems={"center"}
      p={"1"}
      _hover={{
        cursor: "pointer",
        color: "white",
        bg: "gray.400",
      }}
      onClick={() =>
        setSelectedConversation({
          _id: conversation._id,
          userId: user._id,
          userProfilePic: user.profilePic,
          username: user.username,
          mock: conversation.mock,
        })
      }
      bg={
        selectedConversation?._id === conversation._id
          ? colorMode === "light"
            ? "gray.600"
            : "gray.600"
          : ""
      }
      color={
        selectedConversation?._id === conversation._id
          ? colorMode === "light"
            ? "gray.100"
            : "gray.100"
          : ""
      }
      borderRadius={"md"}
    >
      <WrapItem>
        {" "}
        <Avatar
          size={{
            base: "xs",
            sm: "sm",
            md: "md",
          }}
          src={user.profilePic}
        >
          {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
        </Avatar>
      </WrapItem>
      <Stack direction={"column"} fontSize={"sm"}>
        <Text fontWeight="700" display={"flex"} alignItems={"center"}>
          {user.username}
          <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
        <Box fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
          {currentUser._id === lastMessage.sender ? (
            <Box color={lastMessage.seen ? "green.400" : ""}>
              {" "}
              <BsCheck2All size={16} />
            </Box>
          ) : (
            ""
          )}

          <Text fontSize={"xs"}>
            {lastMessage.text.length > 20
              ? lastMessage.text.substring(0, 24) + "..."
              : lastMessage.text || <BsFillImageFill size={18} />}
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Conversation;
