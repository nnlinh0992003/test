import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Select,
} from "@chakra-ui/react";
import { InfraObjectProcess, AcceptProcessRequest } from "../../type/models";

interface AcceptProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  infra: InfraObjectProcess | null;
  onSubmit: (data: AcceptProcessRequest) => Promise<void>;
}

const AcceptProcessModal: React.FC<AcceptProcessModalProps> = ({
  isOpen,
  onClose,
  infra,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Omit<AcceptProcessRequest, "infraProcessId">>({
    title: "",
    description: "",
    name: "",
    additionalData: "",
    manageUnit: "",
    level: 0,
    assignedTo: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const levelOptions = [
    { label: "Normal", value: 0 },
    { label: "Low", value: 1 },
    { label: "Medium", value: 2 },
    { label: "High", value: 3 },
  ];

  const handleSubmit = async () => {
    if (!infra || !infra.id) {
      setError("Infrastructure object is not selected or invalid.");
      return;
    }
    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    setIsLoading(true);
    try {
      setError(null);
      await onSubmit({
        infraProcessId: infra.id,
        ...formData,
      });
      onClose();
    } catch (err) {
      setError("Failed to accept process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onCloseModal = () => {
    setFormData({
      title: "",
      description: "",
      name: "",
      additionalData: "",
      manageUnit: "",
      level: 0,
      assignedTo: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent width="40vw" maxWidth="none">
        <ModalHeader>Accept:  {infra?.keyId} - {infra?.name} </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Text color="red.500" mb={4}>
              {error}
            </Text>
          )}
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter the title for accepting this object"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter any additional notes"
            />
          </FormControl>
          {infra?.eventStatus === "NEW" &&(<>
          <FormControl mt={4}>
            <FormLabel>Name</FormLabel>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter the name"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Additional Data</FormLabel>
            <Textarea
              value={formData.additionalData}
              onChange={(e) => setFormData({ ...formData, additionalData: e.target.value })}
              placeholder="Enter additional data"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Manage Unit</FormLabel>
            <Input
              value={formData.manageUnit}
              onChange={(e) => setFormData({ ...formData, manageUnit: e.target.value })}
              placeholder="Enter the managing unit"
            />
          </FormControl></>)}
          <FormControl mt={4}>
            <FormLabel>Level</FormLabel>
            <Select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              placeholder="Select level"
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Assigned To</FormLabel>
            <Input
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="Enter the assigned person/unit"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={isLoading}>
            Accept
          </Button>
          <Button variant="ghost" onClick={onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AcceptProcessModal;