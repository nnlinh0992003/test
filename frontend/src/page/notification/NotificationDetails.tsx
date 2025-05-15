import React from 'react';
import {
  Box,
  Text,
  Badge,
  Flex,
  Grid,
  GridItem,
  Container,
  Spinner,
  Button,
  Image,
  useDisclosure,
  Heading,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock, Tag } from 'react-feather';
import { useGetNotificationQuery } from '../../redux/service/notification';
import { formatDate, parseAdditionalData } from '../../type/utils';
import ImageModal from '../../component/common/ImageModal';

const NotificationDetails = () => {
  const { notificationId } = useParams<{ notificationId: string }>();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: notification,
    isLoading,
    isError,
  } = useGetNotificationQuery(notificationId ?? '');

  useEffect(() => {
    if (isError || (!isLoading && !notification)) {
      navigate('/not-found');
    }
  }, [isError, isLoading, notification, navigate]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

  if (!notification) return null;
  const additionalData = parseAdditionalData(notification);

  return (
    <Container maxW="100%" py={6}>
      <Box bg="white" borderRadius="xl" boxShadow="lg" overflow="hidden">
      <Box bg="blue.50" p={4} borderTop="1px" borderColor="blue.100">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'start', md: 'center' }}
          >
            <VStack spacing={2} align="start">
              <HStack spacing={2}>
                <Icon as={Clock} w={4} h={4} color="gray.500" />
                <Text color="gray.500" fontSize="2xl" fontWeight="medium">
                  {formatDate(notification.createdAt)}
                </Text>
              </HStack>
            </VStack>
            <Badge
              colorScheme={notification.isRead ? 'green' : 'blue'}
              fontSize="sm"
              px={4}
              py={1}
              borderRadius="full"
              mt={{ base: 4, md: 0 }}
            >
              {notification.isRead ? 'Read' : 'Unread'}
            </Badge>
          </Flex>
        </Box>
        {/* Main Content */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} p={6}>
          {/* Left Side: Description and Additional Data */}
          <GridItem>
            <VStack spacing={6} align="stretch">

            <Box
                bg="gray.50"
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
              >
                <Heading size="sm" mb={3} color="gray.700">
                  Title
                </Heading>
                <Text fontSize="md" color="gray.700" whiteSpace="pre-line" lineHeight="tall">
                  {notification.title}
                </Text>
              </Box>
              
              {/* Description */}
              <Box
                bg="gray.50"
                p={6}
                borderRadius="lg"
                border="1px"
                borderColor="gray.200"
              >
                <Heading size="sm" mb={3} color="gray.700">
                  Description
                </Heading>
                <Text fontSize="md" color="gray.700" whiteSpace="pre-line" lineHeight="tall">
                  {notification.body}
                </Text>
              </Box>

              {/* Additional Data */}
              {additionalData && Object.keys(additionalData).length > 0 && (
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                >
                  <Box bg="gray.50" p={4} borderBottomWidth="1px">
                    <Heading size="sm" color="gray.700">
                      Additional Details
                    </Heading>
                  </Box>
                  <Box p={4}>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      {Object.entries(additionalData).map(([key, value]) => (
                        <DetailItem
                          key={key}
                          icon={Tag}
                          label={formatLabel(key)}
                          value={typeof value === 'string' ? value : JSON.stringify(value)}
                          badgeColor={key.toLowerCase() === 'status' ? getStatusColor(value) : undefined}
                        />
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* Right Side: Image and Actions */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Image Preview */}
              {additionalData?.urlImage && (
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                  transition="all 0.2s"
                  _hover={{ boxShadow: "lg" }}
                >
                  <Image
                    src={additionalData.urlImage}
                    alt="Notification image"
                    objectFit="cover"
                    w="100%"
                    h={{ base: '200px', md: '250px' }}
                    onClick={onOpen}
                    cursor="pointer"
                    fallback={
                      <Flex bg="gray.100" justify="center" align="center" h="100%">
                        <Icon as={AlertCircle} w={12} h={12} color="gray.400" />
                      </Flex>
                    }
                  />
                </Box>
              )}

              {/* Action Button */}
              {additionalData?.scheduleId && (
                <Button
                  as={Link}
                  to={`/process/${additionalData?.scheduleId}`}
                  colorScheme="blue"
                  rightIcon={<ArrowRight size={16} />}
                  size="lg"
                  width="full"
                  boxShadow="sm"
                  _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  View Schedule Process
                </Button>
              )}
            </VStack>
          </GridItem>
        </Grid>

        {/* Footer Section: Title, Created At, and Status */}

      </Box>

      {/* Image Modal */}
      <ImageModal
        isOpen={isOpen}
        onClose={onClose}
        imageUrl={additionalData?.urlImage || ''}
        title="Notification Image"
      />
    </Container>
  );
};

// Helper function to determine status color
const getStatusColor = (status?: string) => {
  if (!status) return 'gray';

  const statusLower = status.toLowerCase();
  if (statusLower.includes('active') || statusLower.includes('success')) return 'green';
  if (statusLower.includes('warning')) return 'yellow';
  if (statusLower.includes('error') || statusLower.includes('danger')) return 'red';
  if (statusLower.includes('info')) return 'blue';

  return 'gray';
};

// Helper function to format label from key
const formatLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// DetailItem component for displaying additional data
const DetailItem = ({
  icon,
  label,
  value,
  badgeColor,
}: {
  icon: any;
  label: string;
  value?: string;
  badgeColor?: string;
}) => (
  <GridItem>
    <HStack spacing={3} align="center">
      <Icon as={icon} w={5} h={5} color="blue.500" />
      <VStack spacing={0} align="start">
        <Text fontSize="xs" color="gray.500" fontWeight="medium">
          {label}
        </Text>
        {badgeColor ? (
          <Badge colorScheme={badgeColor} px={2} py={1} borderRadius="full">
            {value || 'N/A'}
          </Badge>
        ) : (
          <Text fontSize="sm" fontWeight="semibold" noOfLines={1} title={value || 'N/A'}>
            {value || 'N/A'}
          </Text>
        )}
      </VStack>
    </HStack>
  </GridItem>
);

export default NotificationDetails;