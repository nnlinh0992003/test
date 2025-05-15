// Components.tsx (Reusable components)
import { forwardRef, useState } from "react";
import {
  Box,
  Text,
  Stack,
  Button,
  Divider,
  Flex,
  Badge,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  HStack,
  FormControl,
  Select,
  FormLabel,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FilterProcessRequests,
  InfraObjectProcess,
  Scheduling,
} from "../../type/models";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import ConfirmModal from "../common/ConfirmModal";
import { format } from "date-fns";
import { getEventStatusColor, getStatusColor, getStatusProcessColor } from "../../type/utils";
import { NyanCatProgressBar, ProcessBar } from "../common/ProcessBar";

// Component for automatically centering map on first object
export const MapAutoCenter: React.FC<{
  infraObjects: InfraObjectProcess[];
}> = ({ infraObjects }) => {
  const map = useMap();

  useEffect(() => {
    if (infraObjects.length > 0) {
      const { latitude, longitude } = infraObjects[0];
  
      if (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        !isNaN(latitude) &&
        !isNaN(longitude)
      ) {
        map.setView([latitude, longitude], 15);
  
        setTimeout(() => {
          const firstMarkerElement = document.querySelector(
            ".leaflet-marker-icon"
          );
          if (firstMarkerElement) {
            (firstMarkerElement as HTMLElement).click();
          }
        }, 500);
      } else {
        console.warn("Invalid latitude/longitude:", latitude, longitude);
      }
    }
  }, [infraObjects, map]);
  

  return null;
};

// Popup component for infrastructure objects
export const InfraPopup: React.FC<{
  infra: InfraObjectProcess;
  onGoToTime: (infra: InfraObjectProcess) => void;
  onAccept: (infra: InfraObjectProcess) => void;
  onReject: (infra: InfraObjectProcess) => void;
}> = ({ infra, onGoToTime, onAccept, onReject }) => {

  const isPending = infra.processStatus === "PENDING";

  return (
<Box w="300px">
      {/* Header */}
        <Text fontWeight="bold">{infra.name}</Text>
        <Flex justify={"space-between"}>
        <Badge colorScheme={getStatusColor(infra.status)} >{infra.status}</Badge>
        <Badge colorScheme={getStatusProcessColor(infra.processStatus)}>{infra.processStatus}</Badge>
        <Badge colorScheme={getEventStatusColor(infra.eventStatus)}>{infra.eventStatus}</Badge>
        </Flex>
        <Text>Category: {infra.category}</Text>
        <Text>Location: {infra?.latitude.toFixed(4)}, {infra?.longitude.toFixed(4)}</Text>
        <Text>Confidence: {(infra.confidence * 100).toFixed(1)}%</Text>
        <Text>Time: {new Date(infra.dateCaptured).toLocaleString()}</Text>
      {/* Image */}
      {infra?.image?.pathUrl && (
        <Box>
          <img
            src={infra.image.pathUrl}
            alt="Infra object"
            style={{ width: "100%", height: "150px", objectFit: "contain", borderRadius: "4px" }}
          />
        </Box>
      )}

      {/* Buttons */}
      <Flex gap={2} mt={2}>
        {isPending && (
          <>
            <Button onClick={() => onAccept(infra)} colorScheme="green" size="sm" flex="1">
              Accept
            </Button>
            <Button onClick={() => onReject(infra)} colorScheme="red" size="sm" flex="1">
              Reject
            </Button>
          </>
        )}
        <Button onClick={() => onGoToTime(infra)} colorScheme="blue" size="sm" flex="1">
          View
        </Button>
      </Flex>
    </Box>
  );
};

// Video player component
export const VideoPlayer = forwardRef<
  HTMLVideoElement,
  {
    videoUrl: string;
    infraObjects: InfraObjectProcess[];
  }
>(({ videoUrl, infraObjects }, ref) => (
  <Box
    w="100%"
    h="100%"
    position="relative"
    borderRadius="md"
    overflow="hidden"
    boxShadow="md"
  >
      <video
        ref={ref}
        controls
        src={videoUrl}
        autoPlay
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: "black",
        }}
      />
  </Box>
));

// Stats component for displaying metrics
export const InfraStats: React.FC<{
  infraObjects: InfraObjectProcess[];
  scheduling: Scheduling;
}> = ({ infraObjects, scheduling }) => {
  const pendingCount = infraObjects.filter(
    (obj) => obj.processStatus === "PENDING"
  ).length;
  const approvedCount = infraObjects.filter(
    (obj) => obj.processStatus === "APPROVED"
  ).length;
  const rejectedCount = infraObjects.filter(
    (obj) => obj.processStatus === "REJECTED"
  ).length;

  const okCount = infraObjects.filter((obj) => obj.status === "OK").length;
  const notOkCount = infraObjects.filter(
    (obj) => obj.status === "NOT OK"
  ).length;
  const lostStatusCount = infraObjects.filter(
    (obj) => obj.status === "LOST"
  ).length;

  const newCount = infraObjects.filter(
    (obj) => obj.eventStatus === "NEW"
  ).length;
  const updatedCount = infraObjects.filter(
    (obj) => obj.eventStatus === "UPDATED"
  ).length;
  const lostEventCount = infraObjects.filter(
    (obj) => obj.eventStatus === "LOST"
  ).length;

  return (
    <Box bg="white" borderRadius="md" maxH="md" overflow="auto">
      {/* Scheduling Info at top */}
      <Box mb={1} pb={1}>
        <Flex justify="space-between" align="center" mb={1} wrap="wrap">
          <Text fontSize="lg" fontWeight="medium">
            Time: {scheduling?.startTime && scheduling?.endTime
              ? `${format(
                  new Date(scheduling?.startTime),
                  "HH:mm:ss"
                )} - ${format(
                  new Date(scheduling?.endTime),
                  "HH:mm:ss"
                )}    ${format(new Date(scheduling?.startTime), "dd/MM/yyyy")}`
              : "N/A"}
          </Text>

          <Badge
            size="lg"
            colorScheme={
              scheduling?.schedulingStatus === "RUNNING"
                ? "blue"
                : scheduling?.schedulingStatus === "DONE"
                ? "green"
                : "gray"
            }
          >
            {scheduling?.schedulingStatus || "UNKNOWN"}
          </Badge>

          <Text fontSize="md" mb={1}>
            Device Code: {scheduling?.deviceCode || "N/A"}
          </Text>
          <Text fontSize="md" mb={1}>
            Vehicle: {scheduling?.vehicle || "N/A"}
          </Text>
          <Text fontSize="md" mb={1}>
            Driver: {scheduling?.driver || "N/A"}
          </Text>
          <Text fontSize="md">
            Route: {scheduling?.route || "N/A"}
          </Text>
        </Flex>
      </Box>

      {/* Stats Section */}
      <Box>
        <SimpleGrid columns={10} spacing={2}>
          {/* Process Status */}
          <Box bg="gray.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="gray.600">Total</Text>
            <Text fontSize="lg" fontWeight="bold">
              {pendingCount + approvedCount + rejectedCount}
            </Text>
          </Box>
          <Box bg="orange.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="orange.600">Pending</Text>
            <Text fontSize="lg" fontWeight="bold" color="orange.500">
              {pendingCount}
            </Text>
          </Box>
          <Box bg="green.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="green.600">Approved</Text>
            <Text fontSize="lg" fontWeight="bold" color="green.500">
              {approvedCount}
            </Text>
          </Box>
          <Box bg="red.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="red.600">Rejected</Text>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              {rejectedCount}
            </Text>
          </Box>

          {/* Status */}
          <Box bg="green.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="green.600">OK</Text>
            <Text fontSize="lg" fontWeight="bold" color="green.500">
              {okCount}
            </Text>
          </Box>
          <Box bg="red.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="red.600">Not OK</Text>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              {notOkCount}
            </Text>
          </Box>
          <Box bg="yellow.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="yellow.600">Lost</Text>
            <Text fontSize="lg" fontWeight="bold" color="yellow.500">
              {lostStatusCount}
            </Text>
          </Box>
          {/* Event Status */}
          <Box bg="blue.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="blue.600">New</Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.500">
              {newCount}
            </Text>
          </Box>
          <Box bg="purple.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="purple.600">Updated</Text>
            <Text fontSize="lg" fontWeight="bold" color="purple.500">
              {updatedCount}
            </Text>
          </Box>
          <Box bg="pink.50" p={2} borderRadius="sm" textAlign="center">
            <Text fontSize="xs" color="pink.600">Lost</Text>
            <Text fontSize="lg" fontWeight="bold" color="pink.500">
              {lostEventCount}
            </Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};


// Filters component
export const FilterControls: React.FC<{
  filters: FilterProcessRequests;
  onFilterChange: (field: keyof FilterProcessRequests, value: string) => void;
  onProcessAll: () => void;
  onSwitchView: () => void;
  view:string
  isProcessing: boolean;
}> = ({ filters, onFilterChange, onProcessAll, onSwitchView, view, isProcessing }) => {
  return (
    <HStack
      spacing={4}
      align="flex-end"
      py={4}
      px={2}
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      wrap="wrap"
      justify="flex-start"
    >
      <FormControl maxW="160px">
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
          Status
        </FormLabel>
        <Select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          placeholder="All Status"
          size="sm"
          bg="white"
          borderColor="gray.300"
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px blue.500",
          }}
        >
          <option value="OK">OK</option>
          <option value="NOT OK">NOT OK</option>
          <option value="LOST">LOST</option>
        </Select>
      </FormControl>

      <FormControl maxW="160px">
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
          Process Status
        </FormLabel>
        <Select
          value={filters.processStatus}
          onChange={(e) => onFilterChange("processStatus", e.target.value)}
          placeholder="All"
          size="sm"
          bg="white"
          borderColor="gray.300"
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px blue.500",
          }}
        >
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </Select>
      </FormControl>

      <FormControl maxW="160px">
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
          Event Status
        </FormLabel>
        <Select
          value={filters.eventStatus}
          onChange={(e) => onFilterChange("eventStatus", e.target.value)}
          placeholder="All Event Status"
          size="sm"
          bg="white"
          borderColor="gray.300"
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px blue.500",
          }}
        >
          <option value="NEW">NEW</option>
          <option value="UPDATED">UPDATED</option>
          <option value="LOST">LOST</option>
        </Select>
      </FormControl>
      {/* <FormControl maxW="160px">
        <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
          Type
        </FormLabel>
        <Select
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
          placeholder="All Type"
          size="sm"
          bg="white"
          borderColor="gray.300"
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px blue.500",
          }}
        >
          <option value="ASSET">ASSET</option>
          <option value="ABNORMALITY">ABNORMALITY</option>
        </Select>
      </FormControl> */}

        <Button
          colorScheme="blue"
          size="sm"
          px={4}
          fontWeight="medium"
          onClick={onProcessAll}
          _hover={{ bg: "blue.600" }}
          _active={{ bg: "blue.700" }}
        >
          Infra Management
        </Button>
      <Button
          colorScheme="blue"
          size="sm"
          px={4}
          fontWeight="medium"
          onClick={onSwitchView}
        >
          {view === "map" ? "Table View" : "Map View"}
        </Button>
        {
          isProcessing && (
            <NyanCatProgressBar/>
          )
        }
    </HStack>
  );
};
