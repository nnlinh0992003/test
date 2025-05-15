import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Box,
  HStack,
  Text,
  Flex,
  AccordionPanel,
  Center,
  VStack,
  Badge,
} from "@chakra-ui/react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  LayersControl,
} from "react-leaflet";
import { GpsLog, Scheduling } from "../../type/models";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { getSchedulingStatusColor } from "../../type/utils";

// Default Leaflet icon configuration
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Component to auto-center map on GPS data
const MapAutoCenter: React.FC<{ gpsData: GpsLog[] }> = ({ gpsData }) => {
  const map = useMap();

  useEffect(() => {
    if (gpsData.length > 0) {
      const { latitude, longitude } = gpsData[0];
      map.setView([latitude, longitude], 15);
    }
  }, [gpsData, map]);

  return null;
};

const renderEmptyState = () => (
  <Center h="100%" w="100%">
    <VStack spacing={4} textAlign="center">
      <Text fontSize="2xl" fontWeight="bold" color="gray.500">
        No Schedules Found
      </Text>
      <Text color="gray.400">There are currently no schedules to display.</Text>
    </VStack>
  </Center>
);

const renderPlaceholder = () => (
  <Center h="100%" w="100%">
    <VStack spacing={4} textAlign="center">
      <Text fontSize="2xl" fontWeight="bold" color="gray.500">
        Select a Schedule
      </Text>
      <Text color="gray.400">
        Choose a schedule from the list to view details
      </Text>
    </VStack>
  </Center>
);

// GPS Point Popup Component
// GPS Point Popup Component
const GpsPointPopup: React.FC<{
  log: GpsLog;
  onGoToTime: (log: GpsLog) => void;
  label?: string;
}> = ({ log, onGoToTime, label }) => (
  <Box>
    {label && (
      <Text fontWeight="bold" color="blue.600">
        {label}
      </Text>
    )}
    <Text>
      <b>Time:</b> {new Date(log.timestamp).toLocaleString()}
    </Text>
    <Text>
      <b>Latitude:</b> {log.latitude}
    </Text>
    <Text>
      <b>Longitude:</b> {log.longitude}
    </Text>
    <Text>
      <b>Accuracy:</b> {log.accuracy} m
    </Text>
    <Text>
      <b>Speed:</b> {log.speed} m/s
    </Text>
    <Text color="blue.500" cursor="pointer" onClick={() => onGoToTime(log)}>
      👉 Go to
    </Text>
  </Box>
);

// Main Component
export const SchedulingListView: React.FC<{ schedules: Scheduling[] }> = ({
  schedules,
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState<Scheduling | null>(
    null
  );
  const [gpsData, setGpsData] = useState<GpsLog[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Get unique dates from schedules
  const uniqueDates = React.useMemo(
    () =>
      Array.from(
        new Set(
          schedules.map((s) => format(new Date(s.startTime), "yyyy-MM-dd"))
        )
      ),
    [schedules]
  );

  // Fetch GPS logs for selected schedule
  useEffect(() => {
    const fetchGpsData = async () => {
      if (!selectedSchedule?.gpsLogsUrl) {
        setGpsData([]);
        return;
      }

      try {
        const response = await fetch(selectedSchedule.gpsLogsUrl);
        const data = await response.json();

        const cleanedData = Array.isArray(data)
          ? data.filter(isValidGpsLog)
          : [];

        setGpsData(cleanedData);
      } catch (error) {
        console.error("Failed to parse GPS logs:", error);
        setGpsData([]);
      }
    };

    fetchGpsData();
  }, [selectedSchedule]);

  // Validate GPS log entry
  const isValidGpsLog = (log: any): log is GpsLog =>
    log &&
    typeof log.latitude === "number" &&
    typeof log.longitude === "number" &&
    !isNaN(log.latitude) &&
    !isNaN(log.longitude);

  // Handle video synchronization with GPS point
  const handleGpsPointClick = (log: GpsLog) => {
    if (gpsData.length > 0 && videoRef.current) {
      const offsetSeconds = (log.timestamp - gpsData[0].timestamp) / 1000;
      if (offsetSeconds >= 0) {
        videoRef.current.currentTime = offsetSeconds;
        videoRef.current.play();
      }
    }
  };

  // Render schedule list for a specific date
  const renderDateSchedules = (date: string) => {
    const daySchedules = schedules.filter(
      (s) => format(new Date(s.startTime), "yyyy-MM-dd") === date
    );

    if (!daySchedules) {
      return renderEmptyState();
    }

    return (
      <AccordionItem key={date} borderWidth="1px" borderRadius="md" mb={3}>
        <AccordionButton px={4} py={3} bg="gray.100" mb={3}>
          <Text fontWeight="bold" fontSize="lg">
            {format(new Date(date), "dd/MM/yyyy")} - {daySchedules.length}{" "}
            Schedules
          </Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          {daySchedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              isSelected={selectedSchedule?.id === schedule.id}
              onSelect={() => setSelectedSchedule(schedule)}
              onViewDetails={() => navigate(`/schedule/${schedule.id}`)}
              onViewProcess={() => navigate(`/process/${schedule.id}`)}
            />
          ))}
        </AccordionPanel>
      </AccordionItem>
    );
  };

  // Render map and video for selected schedule
  const renderSelectedScheduleDetails = () => {
    if (!selectedSchedule) {
      return renderPlaceholder();
    }

    const videoUrl =
      selectedSchedule.videoDetectUrl || selectedSchedule.videoUrl || "";

    return (
      <Flex
        direction={{ base: "column", md: "row" }} // Chuyển sang column trên màn hình nhỏ, row trên màn hình lớn
        h="100%"
        gap={4}
      >
        <VideoPlayer videoUrl={videoUrl} ref={videoRef} />
        <MapView gpsData={gpsData} onGpsPointClick={handleGpsPointClick} />
      </Flex>
    );
  };


  return (
    <Flex h="calc(100vh - 210px)">
      {/* Sidebar with schedule list */}
      <Box
        w="30%"
        overflowY="auto"
        borderRight="1px solid"
        borderColor="gray.200"
        pr={2}
      >
        <Accordion
          allowMultiple
          defaultIndex={uniqueDates.map((_, index) => index)}
        >
          {uniqueDates.map(renderDateSchedules)}
        </Accordion>
      </Box>

      {/* Main content area with video and map */}
      <Box w="70%" p={2}>
        {renderSelectedScheduleDetails()}
      </Box>
    </Flex>
  );
};

// Schedule Item Component
const ScheduleItem: React.FC<{
  schedule: Scheduling;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  onViewProcess: () => void;
}> = ({ schedule, isSelected, onSelect, onViewDetails, onViewProcess }) => (
  <Box
    borderWidth="1px"
    borderRadius="md"
    mb={2}
    boxShadow="sm"
    bg={isSelected ? "blue.50" : "white"}
    px={4}
    py={3}
    cursor="pointer"
    onClick={onSelect}
  >
    <Flex flexWrap="wrap" gap={2} px={2} justifyContent="space-between">
      <Text fontWeight="bold" fontSize="md">
        {`${format(new Date(schedule.startTime), "HH:mm:ss")} - ${format(
          new Date(schedule.endTime),
          "HH:mm:ss"
        )}`}
      </Text>
      <Badge
        colorScheme={getSchedulingStatusColor(schedule.schedulingStatus)}
        px={2}
        py={1}
        borderRadius="md"
      >
        {schedule.schedulingStatus}
      </Badge>
      <Text color="blue.500" fontWeight="bold" onClick={onViewProcess}>
        Process
      </Text>
    </Flex>
  </Box>
);

// Video Player Component
const VideoPlayer = React.forwardRef<HTMLVideoElement, { videoUrl: string }>(
  ({ videoUrl }, ref) => (
    <Box flex="1" position="relative" paddingTop="56.25%">
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
  )
);

// Map View Component
export const MapView: React.FC<{
  gpsData: GpsLog[];
  onGpsPointClick: (log: GpsLog) => void;
}> = ({ gpsData, onGpsPointClick }) => (
  <Box flex="1" position="relative" overflow="hidden">
    <MapContainer
      center={[21.028511, 105.804817]}
      zoom={15}
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      scrollWheelZoom
      attributionControl={false}
      zoomControl={false}
    >
      <MapAutoCenter gpsData={gpsData} />
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Default">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            attribution="Google Maps"
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Topographic">
          <TileLayer
            attribution="Google Maps"
            url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Hiển thị các điểm GPS */}
      {gpsData.map((log, index) => {
        // Điểm start
        if (index === 0) {
          return (
            <CircleMarker
              key="start"
              center={[log.latitude, log.longitude]}
              radius={6} // Lớn hơn để nổi bật
              color="green"
              fillColor="green"
              fillOpacity={1}
            >
              <Popup>
                <GpsPointPopup
                  log={log}
                  onGoToTime={onGpsPointClick}
                  label="Start Point"
                />
              </Popup>
            </CircleMarker>
          );
        }
        // Điểm end
        if (index === gpsData.length - 1) {
          return (
            <CircleMarker
              key="end"
              center={[log.latitude, log.longitude]}
              radius={6}
              color="orange"
              fillColor="orange"
              fillOpacity={1}
            >
              <Popup>
                <GpsPointPopup
                  log={log}
                  onGoToTime={onGpsPointClick}
                  label="End Point"
                />
              </Popup>
            </CircleMarker>
          );
        }
        // Các điểm giữa
        return (
          <CircleMarker
            key={index}
            center={[log.latitude, log.longitude]}
            radius={2}
            color="red"
            fillColor="red"
            fillOpacity={1}
          >
            <Popup>
              <GpsPointPopup log={log} onGoToTime={onGpsPointClick} />
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  </Box>
);
