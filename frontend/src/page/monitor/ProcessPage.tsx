import { useNavigate, useParams } from "react-router-dom";
import {
  useGetProcessFilterQuery,
  useGetUndetectedObjectsQuery,
  useProcessObjectMutation,
  useProcessScheduleMutation,
  useRejectProcessMutation,
} from "../../redux/service/infrastructure";
import {
  AcceptProcessRequest,
  FilterProcessRequests,
  InfraObjectProcess,
  ProcessModelRequest,
  RejectProcessRequest,
  Scheduling,
} from "../../type/models";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Spinner,
  Center,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetScheduleQuery } from "../../redux/service/camera";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useCustomToast from "../../hook/useCustomToast";
import {
  VideoPlayer,
  InfraStats,
  FilterControls,
} from "../../component/monitor/Process";
import { ProcessTable } from "./ProcessTable";
import { Client } from "@stomp/stompjs";
import ProcessMap from "./ProcessMap";
import AcceptProcessModal from "./AcceptProcessModal";
import RejectProcessModal from "./RejectProcessModal";
import { set, sub } from "date-fns";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

interface ProcessPageProps {
  stompClient: Client | null;
}

const ProcessPage: React.FC<ProcessPageProps> = ({ stompClient }) => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { data: schedule, refetch: refetchScheduling } = useGetScheduleQuery(scheduleId || "");
  const toast = useCustomToast();
  const [acceptProcess] = useProcessObjectMutation();
  const [rejectProcess] = useRejectProcessMutation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstMarkerRef = useRef<L.Marker | null>(null);
  const [view, setView] = useState<"map" | "table" | "undetected">("table");
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<FilterProcessRequests>({
    scheduleId: scheduleId || "",
    status: "",
    processStatus: "PENDING",
    eventStatus: "",
    type: "",
    category: "",
  });

  const {
    data: allProcessesData = [],
    isLoading: isLoadingAll,
    refetch: refetchAllProcesses,
  } = useGetProcessFilterQuery(
    {
      params: {
        scheduleId: scheduleId || "",
        status: "",
        processStatus: "",
        eventStatus: "",
        type: "",
        category: "",
      },
    },
    { refetchOnMountOrArgChange: true }
  );

  const {
    data: processFilterData = [],
    isLoading,
    error,
    refetch: refetchFilteredProcesses,
  } = useGetProcessFilterQuery({ params: filters }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (!stompClient || !stompClient.connected) {
      console.warn("STOMP client chưa kết nối");
      return;
    }

    const subscription = stompClient.subscribe(`/topic/process/${scheduleId}`, (message) => {
      try {
        const updatedProcess: InfraObjectProcess = JSON.parse(message.body);
        console.log("WebSocket update:", updatedProcess);
        refetchAllProcesses();
        refetchFilteredProcesses();
        // setIsProcessing(true);
        toast(`Received ${updatedProcess.eventStatus} object`, `${updatedProcess.name} - ${updatedProcess.status}`, "success");
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    const subScheduling = stompClient.subscribe(`/topic/scheduling/${scheduleId}`, (message) => {
      try {
        const otherData = JSON.parse(message.body);
        console.log("WebSocket scheduling update:", otherData);
        refetchScheduling();
        refetchAllProcesses();
        refetchFilteredProcesses();
        // setIsProcessing(false);
        toast(`Scheduling: ${otherData.status}`, `Scheduling updated: ${otherData.time}`, "success");
      } catch (error) {
        console.error("Error processing WebSocket message 2:", error);
      }
    });

    return () => {
      subscription.unsubscribe();
      subScheduling.unsubscribe();
    };
  }, [stompClient, scheduleId, refetchAllProcesses, refetchFilteredProcesses, toast]);

  const { isOpen: isAcceptOpen, onOpen: onAcceptOpen, onClose: onAcceptClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const [selectedInfra, setSelectedInfra] = useState<InfraObjectProcess | null>(null);

  const onAccept = useCallback(
    async (infra: InfraObjectProcess) => {
      setSelectedInfra(infra);
      onAcceptOpen();
    },
    [onAcceptOpen]
  );

  const onReject = useCallback(
    async (infra: InfraObjectProcess) => {
      setSelectedInfra(infra);
      onRejectOpen();
    },
    [onRejectOpen]
  );

  const handleAcceptSubmit = useCallback(
    async (data: AcceptProcessRequest) => {
      if (!selectedInfra) return;

      try {
        await acceptProcess({
          requestBody: data,
        }).unwrap();
        toast("Process Accepted", "Infra object has been accepted.", "success");
        refetchAllProcesses();
        refetchFilteredProcesses();
      } catch (error) {
        console.error("Error accepting process:", error);
        toast("Process Failed", "Failed to accept infra object.", "error");
      }
    },
    [selectedInfra, acceptProcess, toast, refetchAllProcesses, refetchFilteredProcesses]
  );

  const handleRejectSubmit = useCallback(
    async (data: RejectProcessRequest) => {
      if (!selectedInfra) return;

      try {
        await rejectProcess({
          requestBody: data,
        }).unwrap();
        toast("Process Rejected", "Infra object has been rejected.", "success");
        refetchAllProcesses();
        refetchFilteredProcesses();
      } catch (error) {
        console.error("Error rejecting process:", error);
        toast("Process Failed", "Failed to reject infra object.", "error");
      }
    },
    [selectedInfra, rejectProcess, toast, refetchAllProcesses, refetchFilteredProcesses]
  );

  const goToInfraView = ()=>{
    navigate(`/infrastructure/scheduling/${scheduleId}`)
  }

  const handleFilterChange = useCallback(
    (field: keyof FilterProcessRequests, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSwitchView = useCallback(() => {
    setView((prev) => (prev === "map" ? "table" : "map"));
  }, []);

  const handleInfraPointClick = useCallback((infra: InfraObjectProcess) => {
    const frame = infra?.image?.frame ?? 0; 
    if (frame > 0 && videoRef.current) {
      const offsetSeconds = frame / 30 - 1;
      if (offsetSeconds >= 0) {
        videoRef.current.currentTime = offsetSeconds;
        videoRef.current.play();
      }
    }
  }, []);

  const videoUrl = schedule?.videoDetectUrl || schedule?.videoUrl || "";

  return (
    <Box minH="100vh - 400px">
      <AcceptProcessModal
        isOpen={isAcceptOpen}
        onClose={onAcceptClose}
        infra={selectedInfra}
        onSubmit={handleAcceptSubmit}
      />
      <RejectProcessModal
        isOpen={isRejectOpen}
        onClose={onRejectClose}
        infra={selectedInfra}
        onSubmit={handleRejectSubmit}
      />
      <InfraStats infraObjects={allProcessesData} scheduling={schedule as Scheduling} />
      <Box mt={1}>
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          onProcessAll={goToInfraView}
          onSwitchView={handleSwitchView}
          view={view}
          isProcessing={isProcessing}
        />
      </Box>

      {isLoading && !processFilterData.length && (
        <Center p={8} bg="white" borderRadius="md" boxShadow="sm" mt={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Center>
      )}

      {error && (
        <Center p={8} bg="white" borderRadius="md" boxShadow="sm" mt={4}>
          <Text color="red.500">
            Error loading infrastructure data. Please try again.
          </Text>
        </Center>
      )}

      {view === "map" ? (
        <Flex direction="row" h="calc(100vh - 300px)" gap={4} mt={1}>
          <Box w="30%" h="100%" bg="white" borderRadius="md">
            <VideoPlayer
              videoUrl={videoUrl}
              ref={videoRef}
              infraObjects={processFilterData}
            />
          </Box>
          <ProcessMap
            infraObjects={processFilterData}
            onAccept={onAccept}
            onReject={onReject}
            onGoToTime={handleInfraPointClick}
            firstMarkerRef={firstMarkerRef}
          />
        </Flex>
      ) : (
        <ProcessTable
          infraObjects={processFilterData}
          onAccept={onAccept}
          onReject={onReject}
          scheduling={schedule as Scheduling}
          isActive={isActive}
        />
      )}
    </Box>
  );
};

export default ProcessPage;