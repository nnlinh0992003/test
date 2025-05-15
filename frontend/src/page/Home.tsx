import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Image, // Import Image component
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hook/useAuth";

const Home = () => {
  const { isLoggedIn } = useAuth();
  const heroBgGradient = useColorModeValue(
    "linear(to-br, blue.400, teal.500)",
    "linear(to-br, blue.800, teal.700)"
  );
  const featureBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400"); // Slightly lighter text in dark mode
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/dashboard");
    }
  }, [navigate, isLoggedIn]);

  // Define features with placeholder image URLs (using picsum.photos for variety)
  const features = [
    { img: "https://cdn.prod.website-files.com/64be86eaa29fa71f24b00685/663a19b8123af1350f79bca8_What%20is%20Object%20Detection_.png", title: "Object Recognition", text: "AI-powered detection and classification of infrastructure elements with high precision." },
    { img: "https://www.hazardexonthenet.net/global/showimage.ashx?Type=Article&ID=192641", title: "Real-time Monitoring", text: "Live status tracking and geospatial visualization of assets on an interactive map interface." },
    { img: "https://media.licdn.com/dms/image/v2/D4D12AQFE31manMV6RA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1695836050195?e=2147483647&v=beta&t=3EOvFJ5ytwGm6rvUMXrfwaGh-bxiH8qFZukSxMM4MDc", title: "Predictive Alerts", text: "Proactive notifications for potential issues and anomalies using predictive analytics." },
    { img: "https://mmpubsitesv2.s3.ap-south-1.amazonaws.com/cloud/images/news/News_Obsidian.jpg", title: "Data Analytics", text: "Comprehensive data storage and analysis tools for informed infrastructure management." },
  ];

  return (
    <Box width={"full"}>
      {/* Hero Section */}
      <Flex
        align="center"
        justify="center"
        bgGradient={heroBgGradient}
        py={{ base: 24, md: 32 }}
        color="white"
      >
        <Container maxW={"container.lg"} textAlign="center">
          <Heading as="h1" size="3xl" mb={6} fontWeight="extrabold">
            Infrastructure Monitoring System
          </Heading>
          <Text fontSize="xl" mb={10} maxW="3xl" mx="auto">
            Leveraging AI for intelligent monitoring of road infrastructure: guardrails, surfaces, lamp posts, traffic signs, and more.
          </Text>
          <Button
            colorScheme="whiteAlpha"
            bg="white"
            color="blue.500"
            size="lg"
            onClick={() => navigate("/login")}
            _hover={{ bg: "gray.100" }}
            px={8} // Add horizontal padding
          >
            Get Started
          </Button>
        </Container>
      </Flex>

      {/* Features Section */}
      <Box py={20} bg={useColorModeValue("gray.100", "gray.900")}> {/* Slightly different background */}
        <Container maxW={"container.xl"}> {/* Wider container for features */}
          <Heading as="h2" size="xl" textAlign="center" mb={16} color={useColorModeValue("gray.700", "white")}>
            Core Capabilities
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}> {/* Adjust spacing */}
            {/* Feature Card with Image */}
            {features.map((feature, index) => (
              <VStack
                key={index}
                bg={featureBg}
                boxShadow="lg" // Slightly stronger shadow
                borderRadius="lg"
                overflow="hidden" // Hide overflowing parts of the image
                spacing={0} // Remove default spacing, control with padding
                textAlign="center"
                transition="all 0.3s ease-in-out" // Smoother transition
                _hover={{
                  transform: "translateY(-8px)", // More pronounced lift
                  boxShadow: "xl",
                }}
              >
                <Image
                  src={feature.img}
                  alt={`${feature.title} placeholder image`}
                  objectFit="cover" // Ensure image covers the area
                  w="full" // Full width
                  h="180px" // Fixed height for consistency
                  mb={5} // Margin bottom to space from text
                />
                {/* Content Padding */}
                <VStack spacing={3} p={6} align="center"> {/* Add padding to content */}
                  <Heading as="h3" size="md" color={useColorModeValue("gray.800", "white")}>
                    {feature.title}
                  </Heading>
                  <Text color={textColor} fontSize="sm">{feature.text}</Text> {/* Slightly smaller text */}
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;