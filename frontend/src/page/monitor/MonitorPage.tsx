import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import {
  useGetCamerasQuery,
  useGetSchedulingByCameraQuery,
  useGetSchedulingByFilterQuery,
} from "../../redux/service/camera";
import { CameraFilterBar } from "../../component/monitor/CameraFilterBar";
import { SchedulingListView } from "../../component/monitor/SchedulingListView";
import { SchedulingTableView } from "../../component/monitor/SchedulingTableView";
import { AddSchedulingModal } from "../../component/monitor/AddSchedulingModal";
import { Scheduling } from "../../type/models";
import { formatDateTimeScheduling } from "../../type/utils";
import { useParams } from "react-router-dom";

type CameraDashboardProps = {
  mode: string;
};

const CameraDashboard: React.FC<CameraDashboardProps> = ({mode}) => {
  const [cameraId, setCameraId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [schedulingStatus, setSchedulingStatus] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {status = ""} = useParams<{status: string}>();

  const { data: cameras = [] } = useGetCamerasQuery();
  const { data: schedulingByFilter = [] } = useGetSchedulingByFilterQuery(
    { params: {startTime: formatDateTimeScheduling(startDate), endTime: formatDateTimeScheduling(endDate), cameraId:cameraId,  status: status.toUpperCase()} }
  );


  const filteredSchedules = schedulingByFilter.filter((item) =>
    filterDate ? item.startTime.startsWith(filterDate) : true
  );

  return (
    <Box p={2}>
      <CameraFilterBar
        cameras={cameras}
        cameraId={cameraId}
        startDate={startDate}
        endDate={endDate}
        filterDate={filterDate}
        status={status}
        schedulingStatus={schedulingStatus}
        onChangeCamera={setCameraId}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onChangeFilterDate={setFilterDate}
        onChangeStatus={setSchedulingStatus}
        onAddNewClick={onOpen}
        mode={mode}
      />
      {mode === "process" ? (
        <SchedulingListView schedules={filteredSchedules} />
      ) : (
        <SchedulingTableView schedules={filteredSchedules} />
      )}
      <AddSchedulingModal isOpen={isOpen} onClose={onClose}/>
    </Box>
  );
};

export default CameraDashboard;
