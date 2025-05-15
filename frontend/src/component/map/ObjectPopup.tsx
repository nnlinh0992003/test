import { Popup } from "react-leaflet";
import { InfraObject } from "../../type/models";
import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  Badge,
  Button,
} from "@chakra-ui/react";
import { formatConfidence, formatDate, getStatusColor } from "../../type/utils";
import ImageModal from "../common/ImageModal";
import { useDisclosure } from "@chakra-ui/react";
import { Image as ImageIcon } from "react-feather";
import ObjectDetailsModal from "../objects/ObjectDetailsModal";

interface ObjectMarkerProps {
  object: InfraObject;
  isSelected: boolean;
}

const ObjectPopup: React.FC<ObjectMarkerProps> = ({ object }) => {
  const popupBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const { fetchLocationName, locationName, isLoading, isError } = useLocationName(object.latitude, object.longitude);

  //useEffect(() => {
  //  if (isSelected) {
  //    fetchLocationName();
  //  }
  //}, [isSelected]);

  return (
    <Popup>
      <Box maxW="400px" bg={popupBg}>
        <Heading size="md" mb={1} color={textColor}>
          {object.name}
        </Heading>

        <Box mt={1}>
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            Category:{" "}
            <Text as="span" fontWeight="normal">
              {object.category}
            </Text>
          </Text>

          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            Status:{" "}
            <Badge
              colorScheme={getStatusColor(object.status)}
              fontSize="sm"
              borderRadius="md"
            >
              {object.status}
            </Badge>
          </Text>

          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            Last Updated:{" "}
            <Text as="span" fontWeight="normal">
              {formatDate(object.dateCaptured)}
            </Text>
          </Text>

          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            Confidence:{" "}
            <Text as="span" fontWeight="normal">
              {formatConfidence(object.confidence)}%
            </Text>
          </Text>

          <Box fontSize="sm" fontWeight="semibold" color={textColor}>
            Location:{" "}
            {/* <Text as="span" fontWeight="normal">
              {isLoading ? <Spinner size={"xs"} /> : isError ? 'Error fetching location name' : locationName}
            </Text> */}
            <Text as="span" fontWeight="normal">
              {object.location || "N/A"}
            </Text>
          </Box>
          {object?.info?.keyId && (
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              Id:{" "}
              <Text as="span" fontWeight="normal">
                {object.info.keyId}
              </Text>
            </Text>
          )}
          {object?.info?.manageUnit && (
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              Manage Unit:{" "}
              <Text as="span" fontWeight="normal">
                {object.info.manageUnit}
              </Text>
            </Text>
          )}
          {object?.info?.additionalData && (
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              Additional Data:{" "}
              <Text as="span" fontWeight="normal">
                {object.info.additionalData}
              </Text>
            </Text>
          )}

          <Button
            size="sm"
            colorScheme="blue"
            onClick={onOpen}
            width="100%"
            variant={"ghost"}
            leftIcon={<ImageIcon size={14} />}
          >
            View Details
          </Button>
        </Box>
      </Box>

      <ObjectDetailsModal isOpen={isOpen} onClose={onClose} obj={object} />

      {/* <ImageModal
        isOpen={isOpen}
        onClose={onClose}
        imageUrl={object.image?.pathUrl}
        title={object.name}
      /> */}
    </Popup>
  );
};

export default ObjectPopup;
