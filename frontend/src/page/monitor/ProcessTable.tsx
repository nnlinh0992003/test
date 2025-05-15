import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Box,
  Collapse,
  Image,
  Text,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { InfraObjectProcess, Scheduling } from "../../type/models";
import {
  getEventStatusColor,
  getLevel,
  getStatusColor,
  getStatusProcessColor,
} from "../../type/utils";
import { BBoxImage } from "../../component/common/BBoxImage";
import { InfraViewModal } from "./InfraViewModal";

interface InfraProcessTableProps {
  infraObjects: InfraObjectProcess[];
  onAccept: (infra: InfraObjectProcess) => void;
  onReject: (infra: InfraObjectProcess) => void;
  scheduling: Scheduling;
  isActive: boolean;
}

export const ProcessTable: React.FC<InfraProcessTableProps> = ({
  infraObjects,
  onAccept,
  onReject,
  scheduling,
  isActive,
}) => {
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [expandedAbnormalityId, setExpandedAbnormalityId] = useState<string | null>(null);
  const [selectedInfra, setSelectedInfra] = useState<InfraObjectProcess | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  const assetObjects = infraObjects.filter(infra => infra.type === "ASSET");
  const abnormalityObjects = infraObjects.filter(infra => infra.type === "ABNORMALITY");

  useEffect(() => {
    // Initialize with first item expanded in each tab if available
    if (assetObjects.length > 0 && !expandedAssetId) {
      setExpandedAssetId(assetObjects[0].id);
      setTimeout(() => scrollToRow(assetObjects[0].id), 100);
    }
    
    if (abnormalityObjects.length > 0 && !expandedAbnormalityId) {
      setExpandedAbnormalityId(abnormalityObjects[0].id);
      if (activeTabIndex === 1) {
        setTimeout(() => scrollToRow(abnormalityObjects[0].id), 100);
      }
    }
  }, [infraObjects, activeTabIndex]);

  const scrollToRow = (id: string) => {
    if (rowRefs.current[id]) {
      rowRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const toggleAssetRow = (id: string) => {
    if (expandedAssetId === id) {
      // Collapse the row if it's already expanded
      setExpandedAssetId(null);
    } else {
      // Expand the new row and scroll to it
      setExpandedAssetId(id);
      setTimeout(() => scrollToRow(id), 100);
    }
  };

  const toggleAbnormalityRow = (id: string) => {
    if (expandedAbnormalityId === id) {
      // Collapse the row if it's already expanded
      setExpandedAbnormalityId(null);
    } else {
      // Expand the new row and scroll to it
      setExpandedAbnormalityId(id);
      setTimeout(() => scrollToRow(id), 100);
    }
  };

  const handleAccept = useCallback(
    (infra: InfraObjectProcess) => {
      onAccept(infra);
    },
    [onAccept]
  );

  const handleReject = useCallback(
    (infra: InfraObjectProcess) => {
      onReject(infra);
    },
    [onReject]
  );

  const onView = useCallback(
    (infra: InfraObjectProcess) => {
      setSelectedInfra(infra);
    },
    []
  );

  const handleCloseModal = () => {
    setSelectedInfra(null);
  };

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!isActive || selectedInfra) return;
      if (!infraObjects || infraObjects.length === 0) return;

      const currentTab = activeTabIndex === 0 ? assetObjects : abnormalityObjects;
      const currentExpandedId = activeTabIndex === 0 ? expandedAssetId : expandedAbnormalityId;
      const setExpandedId = activeTabIndex === 0 ? setExpandedAssetId : setExpandedAbnormalityId;
      
      let currentIndex = -1;
      if (currentExpandedId) {
        currentIndex = currentTab.findIndex(item => item.id === currentExpandedId);
      }

      if (event.key === "ArrowUp" && currentIndex > 0) {
        const newId = currentTab[currentIndex - 1].id;
        setExpandedId(newId);
        setTimeout(() => scrollToRow(newId), 100);
      } else if (event.key === "ArrowDown" && currentIndex < currentTab.length - 1 && currentIndex >= 0) {
        const newId = currentTab[currentIndex + 1].id;
        setExpandedId(newId);
        setTimeout(() => scrollToRow(newId), 100);
      } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && currentIndex === -1 && currentTab.length > 0) {
        const newId = currentTab[0].id;
        setExpandedId(newId);
        setTimeout(() => scrollToRow(newId), 100);
      }

      if (!currentExpandedId) return;
      const currentItem = currentTab.find(item => item.id === currentExpandedId);
      if (!currentItem) return;
      
      if (event.ctrlKey && event.key === "a" && currentItem.processStatus === "PENDING") {
        handleAccept(currentItem);
      } else if (event.ctrlKey && event.key === "r" && currentItem.processStatus === "PENDING") {
        handleReject(currentItem);
      } else if (event.ctrlKey && event.key === "v") {
        onView(currentItem);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [
    expandedAssetId, 
    expandedAbnormalityId, 
    assetObjects, 
    abnormalityObjects, 
    handleAccept, 
    handleReject, 
    onView, 
    selectedInfra, 
    isActive, 
    activeTabIndex
  ]);

  const renderTable = (items: InfraObjectProcess[], expandedId: string | null, toggleRow: (id: string) => void, type: string) => {
    return (
      <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th width="15%">Id</Th>
              <Th width="20%">Name</Th>
              <Th width="15%">Category</Th>
              <Th width="10%">Status</Th>
              <Th width="10%">Process</Th>
              <Th width="10%">Type</Th>
              <Th width="25%">Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((infra) => (
              <React.Fragment key={infra.id}>
                <Tr
                  ref={(el) => (rowRefs.current[infra.id] = el)}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => toggleRow(infra.id)}
                  bg={expandedId === infra.id ? "gray.100" : "white"}
                >
                  <Td width="15%">{infra.keyId}</Td>
                  <Td width="20%">{infra.name}</Td>
                  <Td width="15%">{infra.category}</Td>
                  <Td width="10%">
                    <Badge colorScheme={getStatusColor(infra.status)}>
                      {infra.status}
                    </Badge>
                  </Td>
                  <Td width="10%">
                    <Badge colorScheme={getStatusProcessColor(infra.processStatus)}>
                      {infra.processStatus}
                    </Badge>
                  </Td>
                  <Td width="10%">
                    <Badge colorScheme={getEventStatusColor(infra.eventStatus)}>
                      {infra.eventStatus}
                    </Badge>
                  </Td>
                  <Td width="25%">{new Date(infra.dateCaptured).toLocaleString()}</Td>
                </Tr>
                <Tr>
                  <Td colSpan={7} p={0}>
                    <Collapse in={expandedId === infra.id} animateOpacity>
                      {expandedId === infra.id && (
                        <Box p={2} maxH="300px" overflowY="auto">
                          <HStack spacing={4} align="flex-start" justify="space-between">
                            {/* Column 1: Details */}
                            <VStack width="30%" align="flex-start" justify="flex-start" spacing={1}>
                              <Text fontSize="xs" fontWeight="bold" color={"blue.500"}>
                                Details
                              </Text>
                              <Text fontSize="xs">
                                <strong>Id:</strong> {infra.keyId || "N/A"}
                              </Text>
                              <Text fontSize="xs">
                                <strong>Name:</strong> {infra.name || "N/A"}
                              </Text>
                              <Text fontSize="xs">
                                <strong>Category:</strong> {infra.category || "N/A"}
                              </Text>
                              <Text fontSize="xs">
                                <strong>Location:</strong> {infra.location || "N/A"}
                              </Text>
                            </VStack>

                            {/* Column 2: Metrics */}
                            <VStack width="20%" align="flex-start" justify="flex-start" spacing={1}>
                              <Text fontSize="xs" fontWeight="bold" color={"blue.500"}>
                                Metrics
                              </Text>
                              <Text fontSize="xs">
                                <strong>Status:</strong>{" "}
                                <Badge colorScheme={getStatusColor(infra.status)}>
                                  {infra.status}
                                </Badge>
                              </Text>
                              <Text fontSize="xs">
                                <strong>Process:</strong>{" "}
                                <Badge
                                  colorScheme={getStatusProcessColor(infra.processStatus)}
                                >
                                  {infra.processStatus}
                                </Badge>
                              </Text>
                              <Text fontSize="xs">
                                <strong>Date:</strong>{" "}
                                {new Date(infra.dateCaptured).toLocaleString()}
                              </Text>
                              <Text fontSize="xs">
                                <strong>Confidence:</strong>{" "}
                                {(infra.confidence * 100).toFixed(1)}%
                              </Text>
                              <Text fontSize="xs">
                                <strong>Existed {infra.type === "ASSET" ? "Asset" : "Abnormality"}:</strong>{" "}
                                {infra.infraObject ? "Yes" : "No"}
                              </Text>
                            </VStack>

                            {/* Column 3: Measurements (Abnormality only) */}
                            {infra.type === "ABNORMALITY" && (
                              <VStack width="15%" align="flex-start" justify="flex-start" spacing={1}>
                                <Text fontSize="xs" fontWeight="bold" color={"blue.500"}>
                                  Measurements
                                </Text>
                                <Text fontSize="xs">
                                  <strong>Real Width:</strong>{" "}
                                  {infra.realWidth ? `${infra.realWidth} mm` : "N/A"}
                                </Text>
                                <Text fontSize="xs">
                                  <strong>Real Height:</strong>{" "}
                                  {infra.realHeight ? `${infra.realHeight} mm` : "N/A"}
                                </Text>
                                <Text fontSize="xs">
                                  <strong>Area:</strong>{" "}
                                  { `${(infra.realWidth * infra.realHeight).toFixed(1)} mm²`
                            }
                                </Text>
                                <Text fontSize="xs">
                                  <strong>Level:</strong>{" "}
                                  {infra.level ? getLevel(infra.level) : "N/A"}
                                </Text>
                              </VStack>
                            )}

                            {/* Column 4: Image Crop */}
                            <VStack
                              width={infra.type === "ABNORMALITY" ? "15%" : "20%"}
                              align="flex-start"
                              justify="flex-start"
                              spacing={1}
                            >
                              <Text fontSize="xs" fontWeight="bold" color={"blue.500"}>
                                {infra.status === "LOST" ? "Last Image" : "Image Crop"}
                              </Text>
                              {infra.status === "LOST" && infra.infraObject?.image?.pathUrl ? (
                                <BBoxImage
                                  imageSrc={infra.infraObject.image.pathUrl}
                                  bbox={infra.infraObject.bbox}
                                  alt={`Last image for ${infra.name}`}
                                  style={{
                                    objectFit: "contain",
                                    width: "100%",
                                    height: "150px",
                                  }}
                                />
                              ) : (
                                <BBoxImage
                                  imageSrc={infra?.image?.pathUrl}
                                  bbox={infra?.bbox}
                                  alt={`Image for ${infra.name}`}
                                  style={{
                                    objectFit: "contain",
                                    width: "100%",
                                    height: "150px",
                                  }}
                                />
                              )}
                            </VStack>

                            {/* Column 5: Image Preview */}
                            <VStack
                              width={infra.type === "ABNORMALITY" ? "20%" : "25%"}
                              align="flex-start"
                              justify="flex-start"
                              spacing={1}
                            >
                              <Text fontSize="xs" fontWeight="bold" color={"blue.500"}>
                                {infra.status === "LOST" ? "Original Image" : "Image Preview"}
                              </Text>
                              {infra.status === "LOST" && infra.infraObject?.image?.pathUrl ? (
                                <Image
                                  src={infra.infraObject.image.pathUrl}
                                  alt={`Last image for ${infra.name}`}
                                  maxH="210px"
                                  w="100%"
                                  background="black"
                                  objectFit="contain"
                                  border="1px solid"
                                />
                              ) : (
                                <Image
                                  src={infra?.image?.pathUrl}
                                  alt={`Image for ${infra.name}`}
                                  maxH="210px"
                                  w="100%"
                                  background="black"
                                  objectFit="contain"
                                  border="1px solid"
                                />
                              )}
                            </VStack>

                            {/* Column 6: Actions */}
                            <VStack
                              width="10%"
                              align="flex-start"
                              justify="flex-start"
                              spacing={1}
                            >
                              <Text fontSize="xs" fontWeight="bold" color={"blue.500"}>
                                Actions
                              </Text>
                              <VStack spacing={1} width="100%">
                                {infra.processStatus === "PENDING" && (
                                  <>
                                    <Button
                                      size="xs"
                                      colorScheme="green"
                                      width="100%"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAccept(infra);
                                      }}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      width="100%"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(infra);
                                      }}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  width="100%"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onView(infra);
                                  }}
                                >
                                  View
                                </Button>
                              </VStack>
                            </VStack>
                          </HStack>
                        </Box>
                      )}
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
    );
  };

  return (
    <Box bg="white" overflowX="auto">
      <Tabs isFitted variant="enclosed" onChange={handleTabChange}>
        <TabList>
          <Tab>Assets ({assetObjects.length})</Tab>
          <Tab>Abnormalities ({abnormalityObjects.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={2}>
            {assetObjects.length > 0 ? (
              renderTable(assetObjects, expandedAssetId, toggleAssetRow, "ASSET")
            ) : (
              <Box p={4} textAlign="center">No Asset data available</Box>
            )}
          </TabPanel>
          <TabPanel p={2}>
            {abnormalityObjects.length > 0 ? (
              renderTable(abnormalityObjects, expandedAbnormalityId, toggleAbnormalityRow, "ABNORMALITY")
            ) : (
              <Box p={4} textAlign="center">No Abnormality data available</Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      {selectedInfra && (
        <InfraViewModal
          scheduling={scheduling}
          infra={selectedInfra}
          isOpen={!!selectedInfra}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};