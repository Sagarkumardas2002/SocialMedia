import { Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatDotsFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Flex justifyContent={"space-between"} mb="12" pt={6}>
      {user && (
        <Link as={RouterLink} to="/">
          <AiFillHome size={34} />
        </Link>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}
        >
          Login
        </Link>
      )}
      <Image
        border={"2px"}
        p={"5px"}
        borderRadius={"50%"}
        cursor={"pointer"}
        alt="logo"
        w={10}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        onClick={toggleColorMode}
      />

      {user && (
        <Flex alignItems={"center"} gap={4}>
          <Link as={RouterLink} to={`/${user.username}`}>
            <RxAvatar size={34} />
          </Link>
          <Link as={RouterLink} to={`/chat`}>
            <BsFillChatDotsFill size={32} />
          </Link>
          <Link as={RouterLink} to={`/settings`}>
            <MdOutlineSettings size={32} />
          </Link>
          <Button
            size={"sm"}
            bg={"gray.700"}
            color={"white"}
            _hover={{
              bg: "gray.600",
            }}
            onClick={logout}
          >
            <FiLogOut size={20} />
          </Button>
        </Flex>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("signup")}
        >
          Sign Up
        </Link>
      )}
    </Flex>
  );
};

export default Header;
