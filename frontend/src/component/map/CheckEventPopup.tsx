import { useEffect, useRef, useState } from "react";
import {
  infrastructureApi,
  useMarkFakeEventMutation,
} from "../../redux/service/infrastructure";
import {
  Button,
  Spinner,
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import ConfirmModal from "../common/ConfirmModal";
import { InfraImage } from "../../type/models";

interface CheckEventPopupProps {
  image: InfraImage;
  videoUrl: string;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FPS = 30; // assuming 30 frames per second

const CheckEventPopup: React.FC<CheckEventPopupProps> = ({
  image,
  videoUrl,
  isOpen,
  onClose,
  eventId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [markEvent, { isLoading, isError }] = useMarkFakeEventMutation();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const dispatch = useDispatch();

  const second = image?.frame != null ? image?.frame / FPS : 0;
  const markerPosition = duration > 0 ? (second / duration) * 100 : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      video.currentTime = second;
    };

    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    }
  }, [isOpen, image?.frame]);

  const handleConfirmClose = () => setConfirmOpen(false);
  const handleConfirmOpen = () => setConfirmOpen(true);

  const handleMarkEvent = async () => {
    try {
      await markEvent(eventId);
      dispatch(infrastructureApi.util.invalidateTags(["Objects", "Events"]));
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error("Error marking event as fake", error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Check Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box position="relative" width="100%" paddingTop="56.25%" bg="black">
              <video
                ref={videoRef}
                controls
                src={videoUrl}
                autoPlay
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  backgroundColor: "black",
                }}
              />
              {/* Marker giống YouTube */}
              <Box
                position="absolute"
                bottom="0"
                left={`${markerPosition}%`}
                width="2px"
                height="100%"
                bg="red.500"
                title={`Image Frame: ${image?.frame} (${second.toFixed(2)}s)`}
              />
            </Box>

            <Box textAlign="center" mt={4}>
              <Button
                colorScheme="red"
                onClick={handleConfirmOpen}
                isDisabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : "Report as False"}
              </Button>
              {isError && (
                <Text mt={2} color="red.500">
                  Failed to mark event
                </Text>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleMarkEvent}
        title="Confirm report event as false"
        description="Are you sure you want to mark this event as fake?"
        isLoading={isLoading}
      />
    </>
  );
};

export default CheckEventPopup;
