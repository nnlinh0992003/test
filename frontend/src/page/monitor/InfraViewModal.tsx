import React, { useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  HStack,
  Text,
  Box,
  Image,
} from '@chakra-ui/react';
import { InfraObjectProcess, Scheduling } from '../../type/models';
import { BBoxImage } from '../../component/common/BBoxImage';

interface InfraViewModalProps {
  infra: InfraObjectProcess;
  isOpen: boolean;
  onClose: () => void;
  scheduling: Scheduling;
}

export const InfraViewModal: React.FC<InfraViewModalProps> = ({ infra, isOpen, onClose, scheduling }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hàm xử lý nhảy đến thời điểm video
  const handleInfraPointClick = useCallback(() => {
    const frame = infra?.image?.frame ?? 0; 
    if (videoRef.current) {
      let offsetSeconds = 0;
      if (infra.status === 'LOST' && infra.dateCaptured && scheduling?.startTime) {
        // Tính timestamp dựa trên dateCaptured - startTime
        const capturedTime = new Date(infra.dateCaptured).getTime();
        const startTime = new Date(scheduling.startTime).getTime();
        offsetSeconds = (capturedTime - startTime) / 1000 - 2; // Chuyển đổi sang giây
      } else if (frame > 0) {
        // Tính timestamp dựa trên frame cho trạng thái khác
        offsetSeconds = frame / 30 - 1 ;
      }
      
      if (offsetSeconds >= 0) {
        videoRef.current.currentTime = offsetSeconds;
        videoRef.current.play();
      }
    }
  }, [infra.status, infra.dateCaptured, infra.image?.frame, scheduling?.startTime]);

  // Thêm phím tắt z (jump) và x (close)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!isOpen) return; // Chỉ xử lý khi Modal đang mở

      if (event.key === 'z') {
        handleInfraPointClick(); // Nhảy đến thời điểm video
      } else if (event.key === 'x') {
        onClose(); // Đóng Modal
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, handleInfraPointClick, onClose]);

  const videoUrl = scheduling?.videoDetectUrl || scheduling?.videoUrl || null;
  const isLostStatus = infra.status === 'LOST';
  const frame = infra?.image?.frame ?? 0; 
  const canJumpToTimestamp = isLostStatus
    ? infra.dateCaptured && scheduling?.startTime
    : frame > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Infra Object Details - {infra.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack align="flex-start" spacing={6}>
            {/* Video Preview */}
            {videoUrl && (
              <Box flex="1">
                <Text fontWeight="bold" mb={2}>Video Preview:</Text>
                <Box
                  as="video"
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  width="100%"
                  maxH="400px"
                  border="1px solid"
                  borderRadius="md"
                  bg="black"
                >
                  <Text color="gray.500">Your browser does not support the video tag.</Text>
                </Box>
                {canJumpToTimestamp && (
                  <Text mt={2}>
                    <strong>Video Timestamp:</strong>{' '}
                    {isLostStatus
                      ? (
                          (new Date(infra.dateCaptured).getTime() -
                            new Date(scheduling.startTime).getTime()) /
                          1000
                        ).toFixed(2)
                      : (frame / 30).toFixed(2)}{' '}
                    seconds{' '}
                    <Button
                      size="xs"
                      colorScheme="blue"
                      onClick={handleInfraPointClick}
                      ml={2}
                    >
                      Jump to Timestamp (z)
                    </Button>
                  </Text>
                )}
              </Box>
            )}

            {/* Thông tin InfraObjectProcess và ảnh (chỉ hiển thị nếu không phải LOST) */}
            {!isLostStatus && (
              <Box flex="1">
                <Text fontWeight="bold" mb={2}>Infra Process Details:</Text>
                <HStack spacing={6} align="flex-start">
                  {/* Thời gian InfraObjectProcess */}
                  <Box>
                    <Text>
                      <strong>Date Captured:</strong>{' '}
                      {new Date(infra.dateCaptured).toLocaleString()}
                    </Text>
                  </Box>

                  {/* Ảnh Crop và Full Image */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>Infra Detect Image:</Text>
                    {infra.image ? (
                      <Image
                        src={infra?.image?.pathUrl}
                        alt={`Full image for ${infra.name}`}
                        maxH="300px"
                        w="100%"
                        background="black"
                        objectFit="contain"
                        border="1px solid"
                        borderRadius="md"
                        cursor={frame > 0 ? 'pointer' : 'default'}
                        onClick={handleInfraPointClick}
                      />
                    ) : (
                      <Box
                        bg="gray.200"
                        height="200px"
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                      >
                        <Text color="gray.500">No image available</Text>
                      </Box>
                    )}

                    <Text fontWeight="bold" mt={3} mb={2}>Image Crop:</Text>
                    {infra.image ? (
                      <Box
                        cursor={frame > 0 ? 'pointer' : 'default'}
                        onClick={handleInfraPointClick}
                      >
                        <BBoxImage
                          imageSrc={infra?.image?.pathUrl}
                          bbox={infra?.bbox}
                          alt={`Image for ${infra.name}`}
                          style={{ objectFit: 'contain', width: '100%', height: '150px' }}
                        />
                      </Box>
                    ) : (
                      <Box
                        bg="gray.200"
                        height="150px"
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                      >
                        <Text color="gray.500">No image</Text>
                      </Box>
                    )}
                  </Box>
                </HStack>
              </Box>
            )}

            {/* Thông tin Existed InfraObject hoặc Old Infra Undetected (nếu có) */}
            {infra.infraObject && (
              <Box flex="1">
                <Text fontWeight="bold" mb={2}>
                  {isLostStatus ? 'Old Infra Undetected' : 'Existed Infra Details'}:
                </Text>
                <HStack spacing={6} align="flex-start">
                  {/* Thời gian InfraObject */}
                  <Box>
                    <Text>
                      <strong>Date Captured:</strong>{' '}
                      {infra.infraObject.dateCaptured
                        ? new Date(infra.infraObject.dateCaptured).toLocaleString()
                        : 'N/A'}
                    </Text>
                  </Box>

                  {/* Ảnh của InfraObject */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>Infra Object Image:</Text>
                    {infra.infraObject.image ? (
                      <Image
                        src={infra.infraObject.image.pathUrl}
                        alt={`Image for ${infra.infraObject.name}`}
                        maxH="300px"
                        w="100%"
                        background="black"
                        objectFit="contain"
                        border="1px solid"
                        borderRadius="md"
                      />
                    ) : (
                      <Box
                        bg="gray.200"
                        height="200px"
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                      >
                        <Text color="gray.500">No image available</Text>
                      </Box>
                    )}

                    <Text fontWeight="bold" mt={3} mb={2}>Image Crop:</Text>
                    {infra.infraObject.image ? (
                      <Box>
                        <BBoxImage
                          imageSrc={infra.infraObject.image.pathUrl}
                          bbox={infra.infraObject.bbox || infra.bbox}
                          alt={`Crop image for ${infra.infraObject.name}`}
                          style={{ objectFit: 'contain', width: '100%', height: '150px' }}
                        />
                      </Box>
                    ) : (
                      <Box
                        bg="gray.200"
                        height="150px"
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                      >
                        <Text color="gray.500">No image</Text>
                      </Box>
                    )}
                  </Box>
                </HStack>
              </Box>
            )}
          </HStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close (x)
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};