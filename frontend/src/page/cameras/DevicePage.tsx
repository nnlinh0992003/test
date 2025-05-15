import React, { useState } from "react";
import {
  Box,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Icon,
  Tooltip,
  HStack,
  Button,
  Tag,
  Divider,
  useColorModeValue,
  useBreakpointValue,
  Avatar,
} from "@chakra-ui/react";
import { Camera } from "../../type/models";
import { useGetCamerasQuery } from "../../redux/service/camera";
import { 
  FiSearch, 
  FiCamera, 
  FiCheckCircle, 
  FiXCircle, 
  FiInfo,
  FiClock, 
  FiRefreshCw, 
  FiAlertCircle,
  FiMonitor,
  FiActivity
} from "react-icons/fi";
import { motion } from "framer-motion";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const DevicePage: React.FC = () => {
  const { data: cameras = [], isLoading, error } = useGetCamerasQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const cardBg = useColorModeValue("white", "gray.800");
  const statCardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const statDirection = useBreakpointValue({ base: "column", md: "row" });
  
  if (isLoading) {
    return (
      <Flex p={6} justify="center" align="center" direction="column" height="70vh">
        <Spinner size="xl" thickness="4px" color="blue.500" speed="0.65s" />
        <Text mt={4} fontSize="lg" fontWeight="medium">Loading Devices</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={4} borderRadius="md" variant="left-accent">
        <AlertIcon />
        <Box>
          <Heading size="sm">Error Loading Devices</Heading>
          <Text fontSize="sm">Please check your connection and try again later.</Text>
        </Box>
      </Alert>
    );
  }

  const totalDevices = cameras.length;
  const activeDevices = cameras.filter((c: Camera) => c.cameraStatus === "ACTIVE").length;
  const inactiveDevices = totalDevices - activeDevices;
  const activePercentage = totalDevices > 0 ? (activeDevices / totalDevices) * 100 : 0;
  
  const filteredCameras = cameras.filter((camera: Camera) => {
    const matchesSearch = camera.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          camera.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" && camera.cameraStatus === "ACTIVE") ||
                          (statusFilter === "inactive" && camera.cameraStatus !== "ACTIVE");
    return matchesSearch && matchesStatus;
  });

  return (
    <Box p={4} maxW="1600px" mx="auto">
      <MotionBox 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={6}
      >
        <Flex 
          align="center" 
          mb={2}
        >
          <Icon as={FiCamera} w={6} h={6} color="blue.500" mr={2} />
          <Heading size="lg">Device Management</Heading>
        </Flex>
        <Text color="gray.500">
          Monitor and manage your connected camera devices
        </Text>
      </MotionBox>

      <Flex 
        direction={statDirection}
        mb={6}
        gap={4}
        w="100%"
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MotionCard
          bg={statCardBg}
          boxShadow="md"
          borderRadius="lg"
          p={5}
          flex="1"
          borderWidth="1px"
          borderColor={borderColor}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Flex align="center">
            <Box 
              bg="blue.50"
              p={3}
              borderRadius="full"
              color="blue.500"
              mr={4}
            >
              <Icon as={FiMonitor} w={6} h={6} />
            </Box>
            <Stat>
              <StatLabel fontSize="md" color="gray.600" fontWeight="medium">
                Total Devices
              </StatLabel>
              <StatNumber fontSize="3xl" color="blue.600">
                {totalDevices}
              </StatNumber>
              <StatHelpText>
                Deployed across all locations
              </StatHelpText>
            </Stat>
          </Flex>
        </MotionCard>
        
        <MotionCard
          bg={statCardBg}
          boxShadow="md"
          borderRadius="lg"
          p={5}
          flex="1"
          borderWidth="1px"
          borderColor={borderColor}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Flex align="center">
            <Box 
              bg="green.50"
              p={3}
              borderRadius="full"
              color="green.500"
              mr={4}
            >
              <Icon as={FiCheckCircle} w={6} h={6} />
            </Box>
            <Stat>
              <StatLabel fontSize="md" color="gray.600" fontWeight="medium">
                Active Devices
              </StatLabel>
              <StatNumber fontSize="3xl" color="green.500">
                {activeDevices}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {activePercentage.toFixed(1)}% of total
              </StatHelpText>
            </Stat>
          </Flex>
        </MotionCard>
        
        <MotionCard
          bg={statCardBg}
          boxShadow="md"
          borderRadius="lg"
          p={5}
          flex="1"
          borderWidth="1px"
          borderColor={borderColor}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Flex align="center">
            <Box 
              bg="red.50"
              p={3}
              borderRadius="full"
              color="red.500"
              mr={4}
            >
              <Icon as={FiXCircle} w={6} h={6} />
            </Box>
            <Stat>
              <StatLabel fontSize="md" color="gray.600" fontWeight="medium">
                Inactive Devices
              </StatLabel>
              <StatNumber fontSize="3xl" color="red.500">
                {inactiveDevices}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                {(100 - activePercentage).toFixed(1)}% of total
              </StatHelpText>
            </Stat>
          </Flex>
        </MotionCard>
      </Flex>

      <Flex 
        mb={6} 
        gap={4} 
        direction={{ base: "column", md: "row" }}
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <InputGroup maxW={{ base: "100%", md: "400px" }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search by name or ID" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="md"
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
          />
        </InputGroup>
        
        <Select 
          maxW={{ base: "100%", md: "200px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          borderRadius="md"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </Select>
        
        <Button 
          leftIcon={<FiRefreshCw />}
          colorScheme="blue" 
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
          ml={{ base: 0, md: "auto" }}
        >
          Reset Filters
        </Button>
      </Flex>

      {filteredCameras.length > 0 ? (
        <SimpleGrid 
          columns={gridColumns} 
          spacing={5} 
          w="100%"
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredCameras.map((camera: Camera, index: number) => (
            <MotionCard
              key={camera.id}
              boxShadow="sm"
              borderRadius="xl"
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
              whileHover={{ 
                y: -4, 
                boxShadow: "0 12px 20px -10px rgba(0, 0, 0, 0.1)" 
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.05 + 0.4 } 
              }}
              height="100%"
            >
              <Box position="relative">
                <Flex 
                  bg="gray.100" 
                  height="100px" 
                  align="center"
                  justify="center"
                  borderBottom="1px"
                  borderColor={borderColor}
                  position="relative"
                >
                  <Icon as={FiCamera} w={10} h={10} color="gray.400" />
                  <Badge
                    position="absolute"
                    top={3}
                    right={3}
                    colorScheme={camera.cameraStatus === "ACTIVE" ? "green" : "red"}
                    fontSize="xs"
                    fontWeight="bold"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {camera.cameraStatus || "UNKNOWN"}
                  </Badge>
                </Flex>

                <Box position="absolute" 
                     top="70px" 
                     left="50%" 
                     transform="translateX(-50%)"
                >
                  <Avatar 
                    size="md" 
                    bg="blue.500" 
                    color="white"
                    name={`${index + 1}`}
                    fontWeight="bold"
                    border="3px solid white"
                  />
                </Box>
              </Box>
              
              <CardHeader pt={8} pb={2} textAlign="center">
                <Heading size="md" noOfLines={1}>
                  {camera.name || "Unnamed Device"}
                </Heading>
                <Text color="gray.500" fontSize="sm" mt={1} fontFamily="monospace">
                  ID: {camera.id}
                </Text>
              </CardHeader>
              
              <Divider borderColor={borderColor} />
              
              <CardBody py={4}>
                <Flex direction="column" gap={3}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiInfo} color="gray.500" />
                    <Text fontWeight="medium">Status:</Text>
                    <Text 
                      color={camera.cameraStatus === "ACTIVE" ? "green.500" : "red.500"}
                      fontWeight="semibold"
                    >
                      {camera.cameraStatus || "N/A"}
                    </Text>
                  </Flex>
                  
                  <Flex align="center" gap={2}>
                    <Icon as={FiClock} color="gray.500" />
                    <Text fontWeight="medium">Updated:</Text>
                    <Text color="gray.600" fontSize="sm">
                      {new Date(camera.updatedAt).toLocaleString() || "N/A"}
                    </Text>
                  </Flex>
                  
                  <Flex align="center" gap={2}>
                    <Icon as={FiActivity} color="gray.500" />
                    <Text fontWeight="medium">Activity:</Text>
                    <Tag size="sm" colorScheme={camera.cameraStatus === "ACTIVE" ? "green" : "gray"}>
                      {camera.cameraStatus === "ACTIVE" ? "Monitoring" : "Offline"}
                    </Tag>
                  </Flex>
                </Flex>
              </CardBody>
              
              <CardFooter 
                bg={useColorModeValue("gray.50", "gray.700")} 
                borderTop="1px" 
                borderColor={borderColor}
                py={3}
              >
                <HStack spacing={2} width="100%" justify="center">
                  <Tooltip label="View Details" placement="top">
                    <Button size="sm" colorScheme="blue" variant="ghost">
                      Details
                    </Button>
                  </Tooltip>
                  <Tooltip label={camera.cameraStatus === "ACTIVE" ? "Deactivate" : "Activate"} placement="top">
                    <Button 
                      size="sm" 
                      colorScheme={camera.cameraStatus === "ACTIVE" ? "red" : "green"} 
                      variant="ghost"
                    >
                      {camera.cameraStatus === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  </Tooltip>
                </HStack>
              </CardFooter>
            </MotionCard>
          ))}
        </SimpleGrid>
      ) : (
        <Box 
          textAlign="center" 
          p={10} 
          bg={cardBg} 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor={borderColor}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon as={FiAlertCircle} w={10} h={10} color="gray.400" mb={4} />
          <Heading size="md" mb={2}>No devices found</Heading>
          <Text color="gray.500">
            Try adjusting your search or filter criteria
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default DevicePage;
