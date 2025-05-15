import { Badge, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { Scheduling } from "../../type/models";
import { getSchedulingStatusColor } from "../../type/utils";
import { useNavigate } from "react-router-dom";

interface SchedulingTableViewProps {
  schedules: Scheduling[];
}

export const SchedulingTableView: React.FC<SchedulingTableViewProps> = ({
  schedules,
}) => {
  const navigate = useNavigate();
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString();

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString();

  const handleRowClick = (id: string) => {
    navigate(`/process/${id}`);
  };

  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
        <Th>Index</Th>
          <Th>Date</Th>
          <Th>Start Time</Th>
          <Th>End Time</Th>
          <Th>Status</Th>
          <Th>Device Code</Th>
          <Th>Vehicle</Th>
          <Th>Driver</Th>
          <Th>Route</Th>
        </Tr>
      </Thead>
      <Tbody>
        {schedules.map((schedule, index) => (
          <Tr key={schedule.id}
          onClick={() => handleRowClick(schedule.id)}
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
          >
                        <Td>{index + 1}</Td>
            <Td>{formatDate(schedule.startTime)}</Td>
            <Td>{formatTime(schedule.startTime)}</Td>
            <Td>{formatTime(schedule.endTime)}</Td>
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
            <Td>{schedule.deviceCode}</Td>
            <Td>{schedule.vehicle}</Td>
            <Td>{schedule.driver}</Td>
            <Td>{schedule.route}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
