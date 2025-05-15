import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Select,
  Text,
} from "@chakra-ui/react";
import { Camera } from "../../type/models";
import { X } from "react-feather";

interface CameraFilterBarProps {
  cameras: Camera[];
  cameraId: string;
  startDate: string;
  endDate: string;
  filterDate: string;
  status: string; // th
  schedulingStatus: string; // th
  onChangeCamera: (id: string) => void;
  onChangeStartDate: (date: string) => void;
  onChangeEndDate: (date: string) => void;
  onChangeFilterDate: (date: string) => void;
  onChangeStatus: (status: string) => void; // th
  onAddNewClick: () => void;
  mode: string
}

export const CameraFilterBar: React.FC<CameraFilterBarProps> = ({
  cameras,
  cameraId,
  startDate,
  endDate,
  filterDate,
  status,
  schedulingStatus,
  onChangeCamera,
  onChangeStartDate,
  onChangeEndDate,
  onChangeFilterDate,
  onChangeStatus,
  onAddNewClick,
  mode
}) => (
  <Flex
    mb={6}
    align="flex-end"
    flexWrap="wrap"
    justify="space-between"
    w="100%"
  >
    <HStack spacing={4} align="flex-end" flexWrap="wrap">
      <Box>
        <Text fontWeight="medium" mb={2}>
          Device
        </Text>
        <Select
          value={cameraId}
          onChange={(e) => onChangeCamera(e.target.value)}
          minW="150px"
        >
              <option value="">All</option>
          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.name}
            </option>
          ))}
        </Select>
      </Box>

      <Box>
        <Text fontWeight="medium" mb={2}>
          Start Time
        </Text>
        <InputGroup minW="150px">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
          />
          {startDate && (
            <InputRightElement>
              <IconButton
                aria-label="Clear start date"
                icon={<X size={16} />}
                size="xs"
                onClick={() => onChangeStartDate("")}
                variant="ghost"
              />
            </InputRightElement>
          )}
        </InputGroup>
      </Box>

      <Box>
        <Text fontWeight="medium" mb={2}>
          End Time
        </Text>
        <InputGroup minW="150px">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
          />
          {endDate && (
            <InputRightElement>
              <IconButton
                aria-label="Clear end date"
                icon={<X size={16} />}
                size="xs"
                onClick={() => onChangeEndDate("")}
                variant="ghost"
              />
            </InputRightElement>
          )}
        </InputGroup>
      </Box>

      {/* <Box>
        <Text fontWeight="medium" mb={2}>
          Status
        </Text>
        <Select
          value={schedulingStatus}
          onChange={(e) => onChangeStatus(e.target.value)}
          minW="200px"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
          <option value="DONE">Done</option>
          <option value="FAILED">Failed</option>
        </Select>
      </Box> */}

      <Box>
        <Text fontWeight="medium" mb={2}>
          Select Date
        </Text>
        <InputGroup minW="150px">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => onChangeFilterDate(e.target.value)}
          />
          {filterDate && (
            <InputRightElement>
              <IconButton
                aria-label="Clear filter date"
                icon={<X size={16} />}
                size="xs"
                onClick={() => onChangeFilterDate("")}
                variant="ghost"
              />
            </InputRightElement>
          )}
        </InputGroup>
      </Box>
    </HStack>
    {mode === "monitor" ?
        <HStack spacing={2} mt={{ base: 4, md: 0 }}>
        <Button colorScheme="green" onClick={onAddNewClick} height="38px">
          Add
        </Button>
      </HStack> : null}
  </Flex>
);
