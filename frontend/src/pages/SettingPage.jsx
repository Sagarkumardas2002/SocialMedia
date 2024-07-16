import { Button, Text } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";

const SettingPage = () => {
  const showToast = useShowToast();
  const logout = useLogout();
  const freezeAccount = async () => {
    if (!window.confirm("Are you sere you want to freeze your account ?")) {
      return;
    }

    try {
      const res = await fetch("/api/users/freeze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      if (data.success) {
        await logout();
        showToast("Success", "Your Account has been freezed", "success");
      }
    } catch (error) {
      console.log("Error", error.message, "error");
    }
  };
  return (
    <>
      <Text my={2} fontSize={25} fontWeight={"bold"}>
        Freeze Your Account
      </Text>
      <Text my={2}>You can Unfreeze you accoun anytime by logging in 😁</Text>
      <Button size={"md"} my={2} colorScheme={"red"} onClick={freezeAccount}>
        Freeze
      </Button>
    </>
  );
};

export default SettingPage;
