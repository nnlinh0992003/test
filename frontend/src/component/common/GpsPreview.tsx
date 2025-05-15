import { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, Spinner, Flex, VStack } from "@chakra-ui/react";
import { MapView } from "../monitor/SchedulingListView";

// Interface for GPS log entry
interface GPSLog {
  timestamp: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  altitude: number;
  bearing: number;
}

// Props for GPSPreview component
interface GPSPreviewProps {
  url: string; // URL to fetch GPS JSON data
}

// Helper function to calculate Haversine distance
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Helper function to format duration from milliseconds
const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// Helper function to format distance
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(2)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

// Helper function to format speed (m/s to km/h)
const formatSpeed = (speedMs: number): string => {
  return `${(speedMs * 3.6).toFixed(2)} km/h`; // 1 m/s = 3.6 km/h
};

// Helper function to format accuracy
const formatAccuracy = (meters: number): string => {
  return `${meters.toFixed(2)} m`;
};

export const GPSPreview: React.FC<GPSPreviewProps> = ({ url }) => {
  const [gpsData, setGpsData] = useState<GPSLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGpsPointClick = (gpsPoint: GPSLog) => {
    // Handle GPS point click event here
  }

  // Fetch GPS data
  useEffect(() => {
    const fetchGpsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch GPS data");
        }
        const data = await response.json();
        // Validate data
        if (!Array.isArray(data) || !data.every((item) => typeof item === "object" && "latitude" in item && "longitude" in item && "timestamp" in item)) {
          throw new Error("Invalid GPS data format");
        }
        setGpsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGpsData();
  }, [url]);

  // Calculate metrics
  const calculateMetrics = () => {
    if (gpsData.length < 1) {
      return { totalDistance: 0, duration: 0, averageSpeed: 0, averageAccuracy: 0 };
    }

    // Total distance
    let totalDistance = 0;
    for (let i = 1; i < gpsData.length; i++) {
      const prev = gpsData[i - 1];
      const curr = gpsData[i];
      totalDistance += haversineDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }

    // Time duration
    const duration = gpsData[gpsData.length - 1].timestamp - gpsData[0].timestamp;

    // Average speed (from speed field)
    const averageSpeed = gpsData.reduce((sum, log) => sum + log.speed, 0) / gpsData.length;

    // Average accuracy
    const averageAccuracy = gpsData.reduce((sum, log) => sum + log.accuracy, 0) / gpsData.length;

    return { totalDistance, duration, averageSpeed, averageAccuracy };
  };

  const { totalDistance, duration, averageSpeed, averageAccuracy } = calculateMetrics();

  if (isLoading) {
    return (
      <Flex justify="center" p={4}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <VStack align="stretch" spacing={4}>
      {/* Metrics Table */}
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Total Distance</Th>
            <Th>Time Duration</Th>
            <Th>Average Speed</Th>
            <Th>Average Accuracy</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{formatDistance(totalDistance)}</Td>
            <Td>{formatDuration(duration)}</Td>
            <Td>{formatSpeed(averageSpeed)}</Td>
            <Td>{formatAccuracy(averageAccuracy)}</Td>
          </Tr>
        </Tbody>
      </Table>
      <Flex>
      <Box
        maxH="400px"
        overflowY="auto"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
        bg="gray.50"
      >
        <pre>{JSON.stringify(gpsData, null, 2)}</pre>
      </Box>
      <MapView
        gpsData={gpsData}
        onGpsPointClick={handleGpsPointClick}/>
      </Flex>
      {/* Pretty-printed JSON */}
    </VStack>
  );
};