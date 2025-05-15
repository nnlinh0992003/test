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
} from "@chakra-ui/react";
import { InfraObjectProcess, RejectProcessRequest } from "../../type/models";

interface RejectProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  infra: InfraObjectProcess | null;
  onSubmit: (data: RejectProcessRequest) => Promise<void>;
}

const RejectProcessModal: React.FC<RejectProcessModalProps> = ({
  isOpen,
  onClose,
  infra,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!infra || !infra.id) {
      setError("Infrastructure object is not selected or invalid.");
      return;
    }
    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setError(null);
      // Gửi request với infraProcessId và formData
      await onSubmit({
        infraProcessId: infra.id,
        title: formData.title,
        description: formData.description,
      });
      onClose();
    } catch (err) {
      setError("Failed to reject process. Please try again.");
    }
  };

  const onCloseModal = () => {
    setFormData({
      title: "",
      description: "",
    });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalOverlay />
      <ModalContent width="40vw" maxWidth="none">
        <ModalHeader>Reject Infrastructure Process</ModalHeader>
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
              placeholder="Enter the title for rejection"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter the reason for rejection"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleSubmit}>
            Reject
          </Button>
          <Button variant="ghost" onClick={onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RejectProcessModal;