import {
  Box,
  Avatar,
  Wrap,
  WrapItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Spacer,
  Progress,
  Stack,
  Text,
  VStack,
  Heading,
  Button,
  Grid,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import image from "../images/logo.jpg";
import { format } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { useAuth } from "../context/authContext";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { FcHome } from "react-icons/fc";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import VideoCards from "../components/videoCards";

export const Home: React.FC = () => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "MMM dd", { locale: enUS });
  const { dailyGoalProgress, bonusClaimed, setBonusClaimed, updateUserData } =
    useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any | null>(null);
  const { state } = useLocation();
  const { totalEarnings, email } = state || {};
  const [showParabensModal, setShowParabensModal] = useState(false);
  const [isWithdrawalButtonEnabled, setIsWithdrawalButtonEnabled] =
    useState(false);

  console.log(totalEarnings);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData(email);
        if (userData) {
          setUserData(userData);
          const createdAt = new Date(userData.created_at);
          const currentTime = new Date();
          const timeDifference = +currentTime - +createdAt;
          const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

          if (timeDifferenceInHours < 1) {
            setShowParabensModal(true);
          }

          localStorage.setItem("balance", userData?.balance);

          setIsWithdrawalButtonEnabled(userData?.balance > 1500);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, [email, userData?.balance, updateUserData]);

  const claimBonus = async () => {
    try {
      const storedEmail = localStorage.getItem("emailLogin");

      if (!storedEmail) {
        console.error("Email is undefined or null");
        return;
      }

      const response = await axiosInstance.post("/add-bonus", {
        email: storedEmail,
      });

      if (response.status === 200) {
        if (setBonusClaimed) {
          setBonusClaimed(true);
        }

        const updatedUserData = await getUserData(storedEmail);

        if (updatedUserData) {
          setUserData(updatedUserData);
        }

        console.log("Bonus claimed successfully!");
      } else {
        console.error("Failed to claim bonus:", response.data.message);
      }
    } catch (error) {
      console.error("Error claiming bonus:", error);
    }
  };

  const getUserData = async (
    emailLogin: string | undefined
  ): Promise<any | null> => {
    try {
      if (!emailLogin) {
        console.error(emailLogin);
        return null;
      }

      const response = await axiosInstance.get(`accountByEmail/${emailLogin}`);

      if (response.status === 200 && response.data && response.data.conta) {
        return response.data.conta;
      } else {
        console.error("Resposta inválida da API:", response);
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return null;
    }
  };

  const handleButtonClick = () => {
    navigate("/requestValue", {
      state: { totalEarnings: userData?.balance, email: userData?.email },
    });
  };

  const handleCloseParabensModal = () => {
    setShowParabensModal(false);
  };

  return (
    <Box background="black" minHeight="100vh" overflowX="hidden">
      <Modal isOpen={showParabensModal} onClose={handleCloseParabensModal}>
        <ModalOverlay />
        <ModalContent>
          <VStack>
            <ModalHeader mt={3}>Congratulations!</ModalHeader>
          </VStack>
          <ModalCloseButton />
          <VStack p={5}>
            <FaCheckCircle color="blue" style={{ marginRight: "8px" }} />
          </VStack>
          <VStack>
            <ModalBody mt={5}>
              <Text>You won ${userData?.balance} dollars!</Text>
            </ModalBody>
          </VStack>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCloseParabensModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box
        borderWidth="1px"
        borderRadius="10px"
        borderColor="gray.300"
        padding="4"
        margin="2"
        backgroundColor="white"
        boxShadow="md"
      >
        <Flex>
          <Wrap>
            <WrapItem>
              <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                <Avatar name="Secret Tool" src={image} />
                <Box>
                  <Heading size="sm">Welcome! {userData?.email}</Heading>
                </Box>
              </Flex>
            </WrapItem>
          </Wrap>
          <Spacer />
          <Box>
            <Stat>
              <StatLabel>Collected</StatLabel>
              <StatNumber>$ {userData?.balance}</StatNumber>
              <StatHelpText>{formattedDate}</StatHelpText>
            </Stat>
          </Box>
        </Flex>
        <Box
          background="white"
          borderWidth="1px"
          borderRadius="10px"
          borderColor="gray.300"
          mt={6}
          p={4}
          m={2}
          mb={10}
          boxShadow="md"
        >
          <Stack spacing={5}>
            <Text fontSize="sm" fontWeight="bold">
              Daily goal: {dailyGoalProgress}% completed
            </Text>
            <Progress colorScheme="green" size="sm" value={dailyGoalProgress} />
          </Stack>
        </Box>
        <Box
          backgroundColor="black"
          borderWidth="1px"
          borderRadius="10px"
          borderColor="gray.300"
          p={4}
          m={2}
          boxShadow="md"
        >
          <Stack backgroundColor="black" spacing={5}>
            <VStack>
              <Button
                backgroundColor="grey"
                fontSize="sm"
                fontWeight="bold"
                onClick={claimBonus}
                isDisabled={bonusClaimed}
              >
                {bonusClaimed
                  ? "Bonus claimed!"
                  : "Reach 100% and get a bonus of $40.0"}
              </Button>
            </VStack>
          </Stack>
        </Box>
        <VStack mt={10}>
          <Box
            backgroundColor="white"
            borderWidth="1px"
            borderRadius="10px"
            borderColor="gray.300"
            p={4}
            m={2}
            boxShadow="md"
          >
            <Stack spacing={5}>
              <Text color="black" fontSize="sm" fontWeight="bold">
                My balance $ {userData?.balance}
              </Text>
            </Stack>
          </Box>
        </VStack>
        <VStack mt={10}>
          <Text fontSize="sm" fontWeight="bold">
            Videos
          </Text>
        </VStack>
        <VStack mt={6} spacing={4} align="stretch">
          <Box
            borderWidth="1px"
            borderRadius="10px"
            borderColor="gray.300"
            p={4}
            bg="white"
            boxShadow="md"
          >
            {/* <VideoMusicList /> */}
            <VideoCards />
            {/* <VideoSportsList /> */}
          </Box>
        </VStack>
      </Box>
      <Box backgroundColor="black" mt={6} p={4} m={2}>
        <Grid templateColumns="repeat(3, 1fr)" gap={3}>
          <VStack>
            <Link>
              <FcHome />
            </Link>
          </VStack>
          <VStack>
            <Button
              backgroundColor="grey"
              onClick={handleButtonClick}
              isDisabled={!isWithdrawalButtonEnabled}
            >
              {isWithdrawalButtonEnabled
                ? "Request Withdrawal"
                : "Insufficient Balance"}
            </Button>
          </VStack>
          <VStack>
            <Link>
              <FaStar />
            </Link>
          </VStack>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
