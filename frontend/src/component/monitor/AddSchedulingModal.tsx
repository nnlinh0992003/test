import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  useAddSchedulingMutation,
  useGetCamerasQuery,
} from "../../redux/service/camera";
import {
  formatDateTimeCreateScheduling,
  formatDateTimeScheduling,
} from "../../type/utils";
import useCustomToast from "../../hook/useCustomToast";
import { Camera, DataCreateScheduling } from "../../type/models";

interface AddSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSchedulingModal: React.FC<AddSchedulingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<DataCreateScheduling>({
    startTime: "",
    endTime: "",
    cameraId: "",
    deviceCode: "",
    vehicle: "",
    driver: "",
    route: "",
  });
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");

  const showToast = useCustomToast();
  const { data: cameras = [] } = useGetCamerasQuery();
  const [addScheduling, { isLoading }] = useAddSchedulingMutation();

  // Update route when start or end point changes
  const updateRoute = (start: string, end: string) => {
    if (start && end) {
      setFormData((prev) => ({ ...prev, route: `${start} - ${end}` }));
    } else {
      setFormData((prev) => ({ ...prev, route: "" }));
    }
  };

  const handleInputChange = (
    field: keyof DataCreateScheduling,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate required fields
    const requiredFields: (keyof DataCreateScheduling)[] = [
      "startTime",
      "endTime",
      "cameraId",
      "deviceCode",
      "vehicle",
      "driver",
      "route",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        showToast(
          "Error",
          `Please provide ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
          "error"
        );
        return;
      }
    }

    try {
      await addScheduling({
        requestBody: {
          ...formData,
          startTime: formatDateTimeCreateScheduling(formData.startTime),
          endTime: formatDateTimeCreateScheduling(formData.endTime),
        },
      }).unwrap();

      showToast("Success", "Schedule created successfully", "success");

      // Reset form and close modal
      setFormData({
        startTime: "",
        endTime: "",
        cameraId: "",
        deviceCode: "",
        vehicle: "",
        driver: "",
        route: "",
      });
      setStartPoint("");
      setEndPoint("");
      onClose();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to create schedule", "error");
    }
  };

  useEffect(() => {
    const selectedCamera = cameras.find((cam) => cam.id === formData.cameraId);
    if (selectedCamera) {
      setFormData((prev) => ({
        ...prev,
        deviceCode: selectedCamera.name || "",
      }));
    }
  }, [formData.cameraId, cameras]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="2xl">
        <ModalHeader>Add New Scheduling</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Left Column: Start Time, End Time, Device, Device Code */}
            <GridItem>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Device</FormLabel>
                  <Select
                    placeholder="Select device"
                    value={formData.cameraId}
                    onChange={(e) =>
                      handleInputChange("cameraId", e.target.value)
                    }
                  >
                    {cameras.map((camera: Camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.name || `Camera ${camera.id}`}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Device Code</FormLabel>
                  <Input
                    isReadOnly
                    placeholder="Device code"
                    value={formData.deviceCode}
                    bg="gray.100"
                  />
                </FormControl>
              </VStack>
            </GridItem>

            {/* Right Column: Vehicle, Driver, Route */}
            <GridItem>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Vehicle</FormLabel>
                  <Input
                    placeholder="Enter vehicle"
                    value={formData.vehicle}
                    onChange={(e) =>
                      handleInputChange("vehicle", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Driver</FormLabel>
                  <Input
                    placeholder="Enter driver name"
                    value={formData.driver}
                    onChange={(e) =>
                      handleInputChange("driver", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Route</FormLabel>
                  <VStack spacing={2}>
                    <Input
                      placeholder="Enter start point"
                      value={startPoint}
                      onChange={(e) => {
                        setStartPoint(e.target.value);
                        updateRoute(e.target.value, endPoint);
                      }}
                    />
                    <Input
                      placeholder="Enter end point"
                      value={endPoint}
                      onChange={(e) => {
                        setEndPoint(e.target.value);
                        updateRoute(startPoint, e.target.value);
                      }}
                    />
                    <Input
                      isReadOnly
                      placeholder="Route"
                      value={formData.route}
                      bg="gray.50"
                    />
                  </VStack>
                </FormControl>
              </VStack>
            </GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSave}
            isLoading={isLoading}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
