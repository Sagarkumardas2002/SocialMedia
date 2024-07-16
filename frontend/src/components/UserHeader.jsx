import { Flex, VStack, Box, Text, Link } from "@chakra-ui/layout";
import { MdLink } from "react-icons/md";
import {
  Avatar,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  useToast,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { BsMessenger } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom); // Loged in user

  // Call useColorModeValue at the top of the component
  const buttonBg = useColorModeValue("gray.400", "gray.600");
  const buttonHoverBg = useColorModeValue("gray.500", "gray.700");
  const buttonTextColor = useColorModeValue("black", "white");
  const buttonHoverTextColor = useColorModeValue("white", "black");
  const menuListBg = useColorModeValue("white", "gray.800");

  const copyURL = () => {
    const currentURl = window.location.href;
    navigator.clipboard.writeText(currentURl).then(() => {
      toast({
        title: "User Name",
        description: "Profile Link Copied",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}> {user.username}</Text>
            <Text
              fontSize={"xs"}
              bg={"gray.600"}
              color={"white"}
              px={2}
              py={1}
              borderRadius={"full"}
            >
              Threads.next
            </Text>
          </Flex>
        </Box>

        <Box>
          <Avatar
            name={user.name}
            src={user.profilePic}
            size={{
              base: "lg",
              md: "xl",
            }}
          />
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text> {user.bio}</Text>

      {/* Original Code  */}
      {currentUser?._id === user._id && (
        <Link as={RouterLink} to="/update">
          <Button
            size={"sm"}
            bg={buttonBg}
            color={buttonTextColor}
            _hover={{
              bg: buttonHoverBg,
              color: buttonHoverTextColor,
            }}
          >
            Update Profile
          </Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
        <Button
          size={"sm"}
          bg={"gray.600"}
          color={"white"}
          onClick={handleFollowUnfollow}
          isLoading={updating}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      )}

      {/* Duplicate Code */}
      {/* {isCurrentUser && (
        <Link as={RouterLink} to="/update">
          <Button size={"sm"}>Update Profile</Button>
        </Link>
      )}
      {!isCurrentUser && currentUser && (
        <Button
          size={"sm"}
          bg={"gray.600"}
          color={"white"}
          onClick={handleFollowUnfollow}
          isLoading={updating}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      )} */}

      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={5} alignItems={"center"}>
          <Text color={"gray.light"}> {user.followers.length} followers</Text>
          <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
          <Link color={"gray.light"}> instagram.com</Link>
        </Flex>

        <Flex>
          <Box className="icon-container">
            <BsMessenger size={30} cursor={"pointer"} />
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size={30} cursor={"pointer"} />
              </MenuButton>
              <Portal bg={useColorModeValue("white", "blue.500")}>
                <MenuList bg={menuListBg}>
                  <MenuItem fontSize={18} marginLeft onClick={copyURL}>
                    Copy Link
                    <MdLink
                      style={{
                        marginLeft: "88px",
                        transform: "rotate(-52deg)", // Rotate the icon
                        fontSize: "1.3em", // Increase the size of the icon
                        color: "#007BFF", // Add color to the icon
                        transition: "color 0.3s ease, transform 0.3s ease", // Transition for hover effects
                      }}
                    />
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={"1.5px solid white"}
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}>Threads</Text>
        </Flex>

        <Flex
          flex={1}
          borderBottom={"1px solid gray"}
          justifyContent={"center"}
          color={"gray.light"}
          pb="3"
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}>Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
