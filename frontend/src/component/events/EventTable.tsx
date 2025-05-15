import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  Select,
} from "@chakra-ui/react";
import {
  Event,
  EventFilterRequest,
  EventStatus,
  InfraCategory,
  InfraStatus,
} from "../../type/models";
import {
  formatConfidence,
  formatDate,
  getEventStatusColor,
  getStatusColor,
} from "../../type/utils";
import { useState, useEffect } from "react";
import { Camera, X } from "react-feather";
import { useNavigate } from "react-router-dom";

interface EventTableProps {
  events: Event[];
  filterCriteria: EventFilterRequest;
  onFilterChange: (filterCriteria: EventFilterRequest) => void;
  onClear: () => void;
}

const EventTable: React.FC<EventTableProps> = ({
  events,
  filterCriteria,
  onFilterChange,
  onClear,
}) => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const handleFilterChange = (
    field: keyof typeof filterCriteria,
    value: any
  ) => {
    onFilterChange({ ...filterCriteria, [field]: value, page: 0 });
  };

  const handleRowClick = (event: Event) => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Box height="full" overflowY="auto">
      <Box overflowX="auto">
        <Table
          variant="simple"
          sx={{
            tableLayout: { base: "auto", md: "fixed" }, // Tắt tableLayout: fixed trên màn hình nhỏ
            minWidth: "1300px", // Đảm bảo bảng có chiều rộng tối thiểu
            borderCollapse: "separate",
            borderSpacing: "0",
            "& th, & td": {
              borderWidth: "1px",
              borderColor: "gray.200",
              padding: { base: "10px", md: "20px" }, // Giảm padding trên màn hình nhỏ
            },
          }}
        >
          <Thead bg="gray.100" position="sticky" top="0" zIndex={1}>
            <Tr>
              <Th width={{ base: "120px", md: "12.5%" }} textAlign="center">
                Name
                <Input
                  size={{ base: "xs", md: "sm" }}
                  placeholder="Filter name..."
                  value={filterCriteria.name || ""}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                />
              </Th>
              <Th width={{ base: "100px", md: "10%" }} textAlign="center">
                Category
                <Select
                  size={{ base: "xs", md: "sm" }}
                  placeholder="All"
                  value={filterCriteria.category || ""}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  mt={2}
                  bg="white"
                  borderRadius="md"
                >
                  {Object.values(InfraCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Th>
              <Th width={{ base: "150px", md: "15%" }} textAlign="center">
                Time Detect
                <Input
                  size={{ base: "xs", md: "sm" }}
                  placeholder="Filter start time..."
                  value={filterCriteria.startTime || ""}
                  onChange={(e) =>
                    handleFilterChange("startTime", e.target.value)
                  }
                  mt={2}
                  bg="white"
                  borderRadius="md"
                  type="datetime-local"
                />
              </Th>
              <Th width={{ base: "150px", md: "15%" }} textAlign="center">
                End Time
                <Input
                  size={{ base: "xs", md: "sm" }}
                  placeholder="Filter end time..."
                  value={filterCriteria.endTime || ""}
                  onChange={(e) =>
                    handleFilterChange("endTime", e.target.value)
                  }
                  mt={2}
                  bg="white"
                  borderRadius="md"
                  type="datetime-local"
                />
              </Th>
              <Th width={{ base: "150px", md: "25%" }} textAlign="center">
                Location
                <Input
                  size={{ base: "xs", md: "sm" }}
                  placeholder="Filter location..."
                  value={filterCriteria.location || ""}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  mt={2}
                  bg="white"
                  borderRadius="md"
                />
              </Th>
              <Th width={{ base: "100px", md: "10%" }} textAlign="center">
                Type
                <Select
                  size={{ base: "xs", md: "sm" }}
                  placeholder="All"
                  value={filterCriteria.eventStatus || ""}
                  onChange={(e) =>
                    handleFilterChange("eventStatus", e.target.value)
                  }
                  mt={2}
                  bg="white"
                  borderRadius="md"
                >
                  {Object.values(EventStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </Th>
              <Th width={{ base: "100px", md: "10%" }} textAlign="center">
                Status
                <Select
                  size={{ base: "xs", md: "sm" }}
                  placeholder="All"
                  value={filterCriteria.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                >
                  {Object.values(InfraStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </Th>
              <Th width={{ base: "80px", md: "10%" }} textAlign="center">
                Level
                <Input
                  size={{ base: "xs", md: "sm" }}
                  placeholder="All"
                  value={filterCriteria.level || ""}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                  min={0}
                  max={3}
                />
              </Th>
              <Th width={{ base: "100px", md: "12%" }} textAlign="center">
                Confidence
                <Select
                  size={{ base: "xs", md: "sm" }}
                  placeholder="All"
                  value={filterCriteria.confidence || ""}
                  onChange={(e) =>
                    handleFilterChange("confidence", e.target.value)
                  }
                  mt={2}
                  bg="white"
                  borderRadius="md"
                >
                  <option value="0.2">0 - 0.2</option>
                  <option value="0.4">0.2 - 0.4</option>
                  <option value="0.6">0.4 - 0.6</option>
                  <option value="0.8">0.6 - 0.8</option>
                  <option value="1.0">0.8 - 1.0</option>
                </Select>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Tr
                  key={event.id}
                  onClick={() => handleRowClick(event)}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  transition="background-color 0.2s"
                >
                  <Td width={{ base: "120px", md: "200px" }} textAlign="center">
                    <Box
                      as="span"
                      display="block"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {event.infraObject.name}
                    </Box>
                  </Td>
                  <Td width={{ base: "100px", md: "200px" }} textAlign="center">
                    <Box
                      as="span"
                      display="block"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {event.infraObject.category}
                    </Box>
                  </Td>
                  <Td width={{ base: "150px", md: "280px" }} textAlign="center">
                    <Box
                      as="span"
                      display="block"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {formatDate(event.dateCaptured)}
                    </Box>
                  </Td>
                  <Td width={{ base: "150px", md: "280px" }} textAlign="center">
                    <Box
                      as="span"
                      display="block"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {formatDate(event.endTime)}
                    </Box>
                  </Td>
                  <Td width={{ base: "150px", md: "280px" }} textAlign="center">
                    <Box
                      as="span"
                      display="block"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {event.infraObject.location}
                    </Box>
                  </Td>
                  <Td width={{ base: "100px", md: "150px" }} textAlign="center">
                    <Badge colorScheme={getEventStatusColor(event.eventStatus)}>
                      {event.eventStatus}
                    </Badge>
                  </Td>
                  <Td width={{ base: "100px", md: "150px" }} textAlign="center">
                    <Badge colorScheme={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </Td>
                  <Td width={{ base: "80px", md: "150px" }} textAlign="center">
                    {event.level}
                  </Td>
                  <Td width={{ base: "100px", md: "150px" }} textAlign="center">
                    {formatConfidence(event.confidence)}%
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={9} textAlign="center" py={4}>
                  No matching events found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default EventTable;
