export type ProcessTicket = {
  id: number;
  title: string;
  description: string;
  createAt: string;
  level: number;
  ticketStatus: string;
  assignedTo: string;
};

import { useNavigate, useParams } from "react-router-dom";
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
} from "../../redux/service/infrastructure";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Button,
} from "@chakra-ui/react";
import { formatDate } from "../../type/utils";
import { useGetScheduleQuery } from "../../redux/service/camera";
import { useRef } from "react";

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    data: event,
    isLoading,
    isError,
  } = useGetEventByIdQuery(eventId as string);
  const { data: schedule } = useGetScheduleQuery(event?.scheduleId || "");
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="50vh">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  if (isError || !event) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="md"
        mt={5}
      >
        <AlertIcon boxSize={10} mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {isError ? "Error Loading Event" : "Event Not Found"}
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {isError
            ? "We couldn't load the event details. Please try again later."
            : "The event you're looking for could not be found."}
        </AlertDescription>
      </Alert>
    );
  }

  const handleGoToFrame = () => {
    const frame = event.image?.frame ?? 0; // nếu undefined => mặc định là 0
  
    if (frame > 0 && videoRef.current) {
      const offsetSeconds = frame / 30 - 1;
      console.log("Offset seconds:", offsetSeconds);
      if (offsetSeconds >= 0) {
        videoRef.current.currentTime = offsetSeconds;
        videoRef.current.play();
      }
    }
  };
  

  return (
    <Container maxW="100%" py={2}>
      {/* Main Content - Split into Two Columns */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Left Column - Event and Object Info */}
        <GridItem>
          <Box>
            <Text fontSize="lg" fontWeight="500" mb={4}>
              Event Information
            </Text>
            <Image
              src={event.image?.pathUrl}
              alt="Event Image"
              objectFit="contain"
              width="100%"
              height="300px"
              fallbackSrc="https://placehold.co/600x400/"
              mb={4}
            />
            <Text>
              <strong>Date Captured:</strong> {formatDate(event.dateCaptured)}
            </Text>
            <Text>
              <strong>End Time:</strong> {formatDate(event.endTime)}
            </Text>
            <Text>
              <strong>Severity Level:</strong> Level {event.level}
            </Text>
            <Text>
              <strong>Confidence:</strong> {(event.confidence * 100).toFixed(1)}
              %
            </Text>
            <Text>
              <strong>Status:</strong> {event.status}
            </Text>
            <Text>
              <strong>Event Status:</strong> {event.eventStatus}
            </Text>
            <Text>
              <strong>Name:</strong> {event.infraObject?.name || "N/A"}
            </Text>
            <Text>
              <strong>Category:</strong>{" "}
              {event.infraObject?.category || "Unknown"}
            </Text>
            <Text>
              <strong>Device ID:</strong> {event.infraObject?.cameraId || "N/A"}
            </Text>
            <Text>
              <strong>Location:</strong>{" "}
              {event.infraObject?.location || "Unknown"}
            </Text>
            <Text>
              <strong>Coordinates:</strong>{" "}
              {event.infraObject?.latitude && event.infraObject?.longitude
                ? `${event.infraObject.latitude}, ${event.infraObject.longitude}`
                : "N/A"}
            </Text>
          </Box>
        </GridItem>

        {/* Right Column - Video and Process Ticket */}
        <GridItem>
          <Box>
            <Text fontSize="lg" fontWeight="500" mb={4}>
              Event Video
            </Text>
            {schedule?.videoUrl ? (
              <Box>
                <video
                  ref={videoRef}
                  autoPlay
                  src={schedule?.videoUrl}
                  controls
                  width="100%"
                  height="300px"
                  style={{ objectFit: "contain" }}
                >
                  Your browser does not support the video tag.
                </video>
                <Button
                  colorScheme="teal"
                  mt={2}
                  onClick={handleGoToFrame}
                >
                  Go to Frame
                </Button>
              </Box>
            ) : (
              <Box
                width="100%"
                height="300px"
                bg="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
                mb={4}
              >
                <Text color="gray.500">No video available</Text>
              </Box>
            )}

            {/* Process Ticket Information */}
            {event.eventTicket ? (
              <Box mt={4}>
                <Text fontSize="lg" fontWeight="500" mb={4}>
                  Event Ticket Information
                </Text>
                <Text>
                  <strong>Title:</strong> {event.eventTicket.title}
                </Text>
                <Text>
                  <strong>Description:</strong> {event.eventTicket.description}
                </Text>
                <Text>
                  <strong>Created At:</strong> {formatDate(event.eventTicket.createAt)}
                </Text>
                <Text>
                  <strong>Level:</strong> Level {event.eventTicket.level}
                </Text>
                <Text>
                  <strong>Status:</strong> {event.eventTicket.ticketStatus}
                </Text>
                <Text>
                  <strong>Assigned To:</strong> {event.eventTicket.assignedTo}
                </Text>
              </Box>
            ) : (
              <Box mt={4}>
                <Text color="gray.500">No process ticket available</Text>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default EventDetails;