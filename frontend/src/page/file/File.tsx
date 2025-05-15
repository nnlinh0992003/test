import { useEffect, useState } from "react";
import {
  useGetCamerasQuery,
  useGetSchedulingByCameraQuery,
  useGetSchedulingByFilterQuery,
} from "../../redux/service/camera";
import {
  formatDateTimeScheduling,
  getSchedulingStatusColor,
} from "../../type/utils";
import { GpsLog, Scheduling } from "../../type/models";
import {
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  Collapse,
  Badge,
  Box,
} from "@chakra-ui/react";
import {
  X,
  Calendar,
  Download,
  Play,
  ChevronDown,
  ChevronUp,
  FileText,
} from "react-feather";
import { GPSPreview } from "../../component/common/GpsPreview";
import { format } from "date-fns";

// Helper function to format time range as hh:mm:ss - hh:mm:ss
const formatTimeRange = (startTime: string, endTime: string): string => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const formatTime = (date: Date) =>
      date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    return `${formatTime(start)} - ${formatTime(end)}`;
  } catch {
    return "Invalid time";
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Helper function to format video duration
const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};

// Helper function to format date as YYYY-MM
// Helper function to group schedules by date
const groupSchedulesByDate = (schedules: Scheduling[]) => {
  const grouped: { [key: string]: Scheduling[] } = {};
  schedules.forEach((schedule) => {
    const date = format(new Date(schedule.startTime), "dd/MM/yyyy");
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(schedule);
  });
  return grouped;
};

// Helper function to fetch file metadata (size and duration)
const fetchFileMetadata = async (
  url: string
): Promise<{ size: number; duration?: number }> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const size = parseInt(response.headers.get("content-length") || "0");
    let duration: number | undefined;

    if (url.includes(".mp4")) {
      const video = document.createElement("video");
      video.src = url;
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve(null);
        video.onerror = () =>
          reject(new Error("Failed to load video metadata"));
      });
      duration = video.duration;
    }

    return { size, duration };
  } catch {
    return { size: 0 };
  }
};

export const FilePage = () => {
  const [cameraId, setCameraId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewScheduleId, setPreviewScheduleId] = useState<string>("");
  const [previewFileType, setPreviewFileType] = useState<
    "video" | "videoDetect" | "gps"
  >("video");
  const [previewMetadata, setPreviewMetadata] = useState<{
    size: number;
    duration?: number;
  } | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const { data: cameras = [], isLoading: isCamerasLoading } =
    useGetCamerasQuery();
  const { data: schedulingByFilter = [], isLoading: isFilterLoading } =
    useGetSchedulingByFilterQuery(
      {
        params: {
          startTime: startDate ? formatDateTimeScheduling(startDate) : "",
          endTime: endDate ? formatDateTimeScheduling(endDate) : "",
          cameraId,
          status: "",
        },
      },
      { skip: !cameraId || (!startDate && !endDate) }
    );
  const { data: schedulingByCam = [], isLoading: isCamLoading } =
    useGetSchedulingByCameraQuery(cameraId, {
      skip: !cameraId || startDate || endDate,
    });

  const [schedules, setSchedules] = useState<Scheduling[]>([]);

  // Handle filter logic
  useEffect(() => {
    if (cameraId && (startDate || endDate)) {
      setSchedules(schedulingByFilter);
    } else if (cameraId) {
      setSchedules(schedulingByCam);
    } else {
      setSchedules([]);
    }
  }, [cameraId, startDate, endDate, schedulingByCam, schedulingByFilter]);

  // Auto-select first camera when cameras load
  useEffect(() => {
    if (!cameraId && cameras.length > 0) {
      setCameraId(cameras[0].id);
    }
  }, [cameras, cameraId]);

  // Fetch metadata when preview opens
  useEffect(() => {
    if (isOpen && previewUrl) {
      setIsMetadataLoading(true);
      fetchFileMetadata(previewUrl).then((metadata) => {
        setPreviewMetadata(metadata);
        setIsMetadataLoading(false);
      });
    }
  }, [isOpen, previewUrl]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handlePreview = (
    url: string,
    scheduleId: string,
    fileType: "video" | "videoDetect" | "gps"
  ) => {
    setPreviewUrl(url);
    setPreviewScheduleId(scheduleId);
    setPreviewFileType(fileType);
    setPreviewMetadata(null); // Reset metadata
    onOpen();
  };

  const handleDownload = async (url: string, fileName: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const toggleCollapse = (date: string) => {
    setCollapsedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const isLoading = isCamerasLoading || isFilterLoading || isCamLoading;
  const groupedSchedules = groupSchedulesByDate(schedules);

  return (
    <VStack spacing={6} align="stretch">
      {/* Filter Section */}
      <Flex bg="white" borderRadius="md" boxShadow="sm" flexWrap="wrap" gap={4}>
        <HStack spacing={4} flexWrap="wrap" align="center">
          <VStack align="start" minW="150px">
            <Text fontWeight="medium">Device</Text>
            <Select
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              isDisabled={isCamerasLoading}
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </Select>
          </VStack>

          <VStack align="start" minW="150px">
            <Text fontWeight="medium">Start Date</Text>
            <InputGroup>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {startDate && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear start date"
                    icon={<X size={16} />}
                    size="xs"
                    onClick={() => setStartDate("")}
                    variant="ghost"
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </VStack>

          <VStack align="start" minW="150px">
            <Text fontWeight="medium">End Date</Text>
            <InputGroup>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {endDate && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear end date"
                    icon={<X size={16} />}
                    size="xs"
                    onClick={() => setEndDate("")}
                    variant="ghost"
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </VStack>

          {(startDate || endDate) && (
            <IconButton
              aria-label="Clear all filters"
              icon={<Calendar size={16} />}
              onClick={handleClearFilters}
              colorScheme="blue"
              variant="outline"
              alignSelf="flex-end"
            />
          )}
        </HStack>
      </Flex>

      {/* Schedules Table */}
      <TableContainer bg="white" borderRadius="md" boxShadow="sm">
        {isLoading ? (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        ) : Object.keys(groupedSchedules).length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No schedules found for the selected filters.
          </Alert>
        ) : (
          <VStack align="stretch" spacing={0}>
            {Object.entries(groupedSchedules).map(([date, schedules]) => (
              <VStack key={date} align="stretch" spacing={0}>
                <Flex
                  justify="space-between"
                  align="center"
                  p={2}
                  bg="gray.50"
                  cursor="pointer"
                  onClick={() => toggleCollapse(date)}
                >
                  <Text fontWeight="bold" fontSize="lg">
                    {date}
                  </Text>
                  <IconButton
                    aria-label={
                      collapsedDates.has(date) ? "Expand" : "Collapse"
                    }
                    icon={
                      collapsedDates.has(date) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronUp size={16} />
                      )
                    }
                    size="sm"
                    variant="ghost"
                  />
                </Flex>
                <Collapse in={!collapsedDates.has(date)}>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th width="15%">Time</Th>
                        <Th width="15%">Status</Th>
                        <Th width="20%">Video</Th>
                        <Th width="20%">Video Detect</Th>
                        <Th width="15%">File GPS</Th>
                        <Th width="15%">Report</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {schedules.map((schedule) => (
                        <Tr key={schedule.id}>
                          <Td>
                            {formatTimeRange(
                              schedule.startTime,
                              schedule.endTime
                            )}
                          </Td>
                          <Td>
                            {" "}
                            <Badge
                              colorScheme={getSchedulingStatusColor(
                                schedule.schedulingStatus
                              )}
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {schedule.schedulingStatus}
                            </Badge>
                          </Td>
                          <Td>
                            {schedule.videoUrl ? (
                              <HStack>
                                <IconButton
                                  aria-label="Preview video"
                                  icon={<Play size={16} />}
                                  size="sm"
                                  onClick={() =>
                                    handlePreview(
                                      schedule.videoUrl,
                                      schedule.id,
                                      "video"
                                    )
                                  }
                                />
                                <IconButton
                                  aria-label="Download video"
                                  icon={<Download size={16} />}
                                  size="sm"
                                  onClick={() =>
                                    handleDownload(
                                      schedule.videoUrl,
                                      `video-${schedule.id}.mp4`
                                    )
                                  }
                                />
                              </HStack>
                            ) : (
                              "-"
                            )}
                          </Td>
                          <Td>
                            {schedule.videoDetectUrl ? (
                              <HStack>
                                <IconButton
                                  aria-label="Preview video detect"
                                  icon={<Play size={16} />}
                                  size="sm"
                                  onClick={() =>
                                    handlePreview(
                                      schedule.videoDetectUrl,
                                      schedule.id,
                                      "videoDetect"
                                    )
                                  }
                                />
                                <IconButton
                                  aria-label="Download video detect"
                                  icon={<Download size={16} />}
                                  size="sm"
                                  onClick={() =>
                                    handleDownload(
                                      schedule.videoDetectUrl,
                                      `video-detect-${schedule.id}.mp4`
                                    )
                                  }
                                />
                              </HStack>
                            ) : (
                              "-"
                            )}
                          </Td>
                          <Td>
                            {schedule.gpsLogsUrl ? (
                              <HStack>
                                <IconButton
                                  aria-label="Preview GPS file"
                                  icon={<FileText size={16} />}
                                  size="sm"
                                  onClick={() =>
                                    handlePreview(
                                      schedule.gpsLogsUrl,
                                      schedule.id,
                                      "gps"
                                    )
                                  }
                                />
                                <IconButton
                                  aria-label="Download GPS file"
                                  icon={<Download size={16} />}
                                  size="sm"
                                  onClick={() =>
                                    handleDownload(
                                      schedule.gpsLogsUrl,
                                      `gps-${schedule.id}.json`
                                    )
                                  }
                                />
                              </HStack>
                            ) : (
                              "-"
                            )}
                          </Td>
                          <Td>
                            -
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Collapse>
              </VStack>
            ))}
          </VStack>
        )}
      </TableContainer>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Preview File</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* File Metadata */}
            <HStack spacing={4}>
              <Text fontWeight="medium">
                Size:{" "}
                {isMetadataLoading
                  ? "Loading..."
                  : previewMetadata?.size
                  ? formatFileSize(previewMetadata.size)
                  : "N/A"}
              </Text>
              {previewFileType !== "gps" && (
                <Text fontWeight="medium">
                  Duration:{" "}
                  {isMetadataLoading
                    ? "Loading..."
                    : previewMetadata?.duration
                    ? formatDuration(previewMetadata.duration)
                    : "N/A"}
                </Text>
              )}
              <Button
                leftIcon={<Download />}
                colorScheme="blue"
                size="sm"
                onClick={() =>
                  handleDownload(
                    previewUrl,
                    previewFileType === "video"
                      ? `video-${previewScheduleId}.mp4`
                      : previewFileType === "videoDetect"
                      ? `video-detect-${previewScheduleId}.mp4`
                      : `gps-${previewScheduleId}.json`
                  )
                }
              >
                Download
              </Button>
            </HStack>

            {/* File Preview */}
            <Box>
              {previewUrl.includes(".mp4") ? (
                <Box flex="1" position="relative" paddingTop="56.25%"
                >
                  <video
                    controls
                    autoPlay
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      backgroundColor: "black",
                    }} // Ensure video fits without stretching
                  >
                    <source src={previewUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              ) : previewUrl.includes(".json") ? (
                <GPSPreview url={previewUrl} />
              ) : (
                <Text>Preview not available for this file type.</Text>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
    </VStack>
  );
};
