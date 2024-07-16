import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import MessageContainer from "../components/MessageContainer";
import useShowToast from "../hooks/useShowToast";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/messagesAtom";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
  const bg = useColorModeValue("gray.600", "gray.500");
  const color = useColorModeValue("white", "black");
  const hoverBg = useColorModeValue("gray.400", "gray.700");
  const hoverColor = useColorModeValue("black", "white");

  const [searchingUser, setSearchingUser] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const currentUser = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const { socket, onlineUsers } = useSocket();

useEffect(() => {
  socket?.on("messagesSeen", ({ conversationId }) => {
    setConversations((prev) => {
      const updatedConversations = prev.map((conversation) => {
        if (conversation._id === conversationId) {
          return {
            ...conversation,
            lastMessage: {
              ...conversation.lastMessage,
              seen: true,
            },
          };
        }
        return conversation;
      });
      return updatedConversations;
    });
  });
}, [socket, setConversations]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);
        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };
    getConversations();
  }, [showToast, setConversations]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (searchedUser.error) {
        showToast("Error", searchedUser.error, "error");
        return;
      }

      //If messaging yourself
      const messagingYourself = searchedUser._id === currentUser._id;
      if (messagingYourself) {
        showToast("Error", "You cannot message yourself", "error");
        return;
      }

      //If user is already in a conversation with the searched user
      const conversationAlreadyExists = conversations.find(
        (conversation) =>
          conversation.participants[0] &&
          conversation.participants[0]._id === searchedUser._id
      );

      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        });
        return;
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      };
      setConversations((prevConvs) => [...prevConvs, mockConversation]);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  return (
    <Box
      position={"absolute"}
      left={"50%"}
      transform={"translateX(-50%)"}
      w={{
        base: "100%",
        md: "800px",
        lg: "1000px",
      }}
      gap={2}
    >
      <Flex
        gap={2}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxW={{
          sm: "500px",
          md: "full",
        }}
        mx={"auto"}
        p={2}
      >
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{
            sm: "250px",
            md: "full",
          }}
          mx={"auto"}
          bg={useColorModeValue("gray.300", "gray.700")}
          p={4}
          borderRadius={"md"}
        >
          <Text
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}
          ></Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input
                placeholder="Search for a user"
                onChange={(e) => setSearchText(e.target.value)}
              />{" "}
              <Button
                size={"md"}
                bg={bg}
                color={color}
                p={4}
                borderRadius="md"
                _hover={{
                  bg: hoverBg,

                  color: hoverColor,
                }}
                onClick={handleConversationSearch}
                isLoading={searchingUser}
              >
                <SearchIcon />
              </Button>
            </Flex>
          </form>

          {loadingConversations &&
            [0, 1, 2, 3, 4].map((_, i) => (
              <Flex key={i} gap={4} alignItems="center" p={1} borderRadius="md">
                <Box>
                  <SkeletonCircle size="10" />
                </Box>
                <Flex w="full" flexDirection="column" gap={3}>
                  <Skeleton h="10px" w="80px" />
                  <Skeleton h="8px" w="90%" />
                </Flex>
              </Flex>
            ))}

          {/* Original code  */}
          {/* {!loadingConversations &&
            conversations.map((conversation) => (
              <Conversation
                key={conversation._id}
                isOnline={onlineUsers.includes(
                  conversation.participants[0]._id
                )}
                conversation={conversation}
              />
            ))} */}

          {!loadingConversations &&
            conversations.map((conversation) =>
              // Check if conversation and participants array exist and have at least one participant
              conversation &&
              conversation.participants &&
              conversation.participants.length > 0 ? (
                <Conversation
                  key={conversation._id}
                  isOnline={onlineUsers.includes(
                    // Check if the first participant exists before accessing its _id
                    conversation.participants[0] &&
                      conversation.participants[0]._id
                  )}
                  conversation={conversation}
                />
              ) : null
            )}
        </Flex>
        {!selectedConversation._id && (
          <Flex
            flex={70}
            borderRadius={"md"}
            p={2}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}
          >
            <GiConversation size={100} />
            <Text fontSize={20}>Select a conversation to start messaging</Text>
          </Flex>
        )}

        {selectedConversation._id && <MessageContainer />}
      </Flex>
    </Box>
  );
};

export default ChatPage;
