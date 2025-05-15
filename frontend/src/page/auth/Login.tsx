import { useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  Link,
  Spinner,
  Flex,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuth from "../../hook/useAuth";
import { LoginRequest } from '../../type/models';
import { FaLock, FaEnvelope } from "react-icons/fa";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginProps {
  fcmToken: string | null;
};

const Login: React.FC<LoginProps> = ({ fcmToken }) => {
  const { isLoggedIn, loginFunc } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    const request: LoginRequest = { email: data.email, password: data.password, fcmToken };
    console.log(request);
    await loginFunc(request);
  };

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const bgGradient = useColorModeValue(
    "linear(to-r, blue.400, blue.600)",
    "linear(to-r, blue.500, purple.500)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      bg={useColorModeValue("gray.50", "gray.900")}
      backgroundImage="url('https://images.unsplash.com/photo-1518655048521-f130df041f66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
      backgroundSize="cover"
      backgroundPosition="center"
      position="relative"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={useColorModeValue("rgba(255,255,255,0.7)", "rgba(26,32,44,0.8)")}
      />
      <Box
        w={["full", "450px"]}
        bg={cardBg}
        shadow="2xl"
        rounded="xl"
        p={8}
        borderWidth={1}
        borderColor={borderColor}
        position="relative"
        transition="all 0.3s"
        _hover={{ transform: "translateY(-5px)" }}
      >
        <Heading 
          as="h2" 
          size="lg" 
          textAlign="center" 
          mb={8}
          bgGradient={bgGradient}
          bgClip="text"
          fontWeight="bold"
        >
          Welcome Back
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={5}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email" fontSize="sm" color="gray.700">
                Email Address
              </FormLabel>
              <Flex align="center">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address"
                    }
                  })}
                  focusBorderColor="blue.500"
                  borderColor="gray.300"
                  color="gray.800"
                  _placeholder={{ color: "gray.500" }}
                  _hover={{ borderColor: "gray.400" }}
                  pl="40px"
                />
                <Icon 
                  as={FaEnvelope} 
                  position="absolute"
                  left="3"
                  color="gray.400"
                  fontSize="lg"
                />
              </Flex>
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password" fontSize="sm" color="gray.700">
                Password
              </FormLabel>
              <Flex align="center">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  focusBorderColor="blue.500"
                  borderColor="gray.300"
                  color="gray.800"
                  _placeholder={{ color: "gray.500" }}
                  _hover={{ borderColor: "gray.400" }}
                  pl="40px"
                />
                <Icon 
                  as={FaLock} 
                  position="absolute"
                  left="3"
                  color="gray.400"
                  fontSize="lg"
                />
              </Flex>
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Box
              display="flex"
              width="full"
              flexDirection="column"
              alignItems="flex-end"
            >
              <Link
                color="blue.500"
                fontSize="sm"
                onClick={() => navigate('/forget-password')}
                _hover={{ textDecoration: "underline", color: "blue.600" }}
                mb={4}
                fontWeight="medium"
              >
                Forget Password?
              </Link>

              <Button
                type="submit"
                isLoading={isSubmitting}
                width="full"
                size="lg"
                py={6}
                bgGradient={bgGradient}
                color="white"
                _hover={{ 
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                _active={{ 
                  bgGradient: "linear(to-r, blue.600, blue.800)",
                  transform: "translateY(0)"
                }}
                transition="all 0.2s"
                borderRadius="md"
              >
                {isSubmitting ? <Spinner /> : 'Sign In'}
              </Button>
            </Box>
          </VStack>
        </form>

        <Flex my={6} alignItems="center" justifyContent="center">
          <Box flex="1">
            <Divider borderColor="gray.300" />
          </Box>
          <Text fontSize="sm" color="gray.500" mx={3} fontWeight="medium">
            or
          </Text>
          <Box flex="1">
            <Divider borderColor="gray.300" />
          </Box>
        </Flex>

        <Button
          variant="outline"
          width="full"
          size="lg"
          onClick={() => navigate('/register')}
          py={6}
          borderColor="blue.500"
          color="blue.600"
          _hover={{ 
            bg: "blue.50",
            transform: "translateY(-2px)",
            boxShadow: "md",
            borderColor: "blue.600"
          }}
          _active={{ 
            bg: "blue.100",
            transform: "translateY(0)"
          }}
          transition="all 0.2s"
          borderRadius="md"
          fontWeight="medium"
        >
          Create New Account
        </Button>
        
        <Text fontSize="xs" color="gray.500" textAlign="center" mt={8}>
          © {new Date().getFullYear()} EIM. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default Login;