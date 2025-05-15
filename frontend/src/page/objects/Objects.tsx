import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Flex,
  Input,
  Select,
  Button,
  Spinner,
  Text,
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Camera as CameraIcon, Search, X } from "react-feather";
import { useGetObjectsQuery } from "../../redux/service/infrastructure";
import { useGetCamerasQuery } from "../../redux/service/camera";
import ObjectTable from "../../component/objects/ObjectTable";
import Pagination from "../../component/common/Pagination";
import { InfraType, ObjectFilterRequest } from "../../type/models";
import AddObjectModal from "../../component/map/AddObjectModal";
import { useParams } from "react-router-dom";
import { getVisiblePages } from "../../type/utils";

const ObjectsPage = () => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const { type, scheduleId = "" } = useParams<{
    type?: string;
    scheduleId: string;
  }>();
  const normalizedType = type?.toUpperCase() as InfraType | "";

  const [filterCriteria, setFilterCriteria] = useState<ObjectFilterRequest>({
    name: null,
    category: null,
    dateCaptured: null,
    location: null,
    status: null,
    cameraId: selectedCamera,
    keyword: debouncedKeyword,
    type: normalizedType,
    keyId: null,
    scheduleId: scheduleId,
    page: 0,
    size: 10, // Default items per page
  });

  const { data: objects, isLoading } = useGetObjectsQuery({
    requestBody: filterCriteria,
  });

  const { data: cameras } = useGetCamerasQuery();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(handler);
  }, [keyword]);

  useEffect(() => {
    setFilterCriteria((prev) => ({
      ...prev,
      page: 0,
      keyword: debouncedKeyword,
    }));
  }, [debouncedKeyword]);

  useEffect(() => {
    setFilterCriteria((prev) => ({
      ...prev,
      cameraId: selectedCamera,
      page: 0,
    }));
  }, [selectedCamera]);

  useEffect(() => {
    setFilterCriteria((prev) => ({
      ...prev,
      type: normalizedType,
      scheduleId: scheduleId,
      page: 0,
    }));
  }, [normalizedType, scheduleId]);

  const handleItemsPerPageChange = (size: number) => {
    setFilterCriteria((prev) => ({
      ...prev,
      size,
      page: 0, // Reset to first page when size changes
    }));
  };

  const handlePageChange = (page: number) => {
    setFilterCriteria((prev) => ({ ...prev, page }));
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedCamera(null);
    setFilterCriteria((prev) => ({
      ...prev,
      name: null,
      category: null,
      dateCaptured: null,
      location: null,
      status: null,
      cameraId: null,
      keyword: "",
      type: normalizedType,
      scheduleId: scheduleId,
      page: 0,
      size: 10, // Reset to default items per page
    }));
  };

  return (
    <VStack align="stretch" height="full" spacing={4}>
      <Flex justify="flex-end" align="center" width="full">
        {/* <HStack spacing={4}>
          {/* Camera Selection (Commented out in original code) */}
          {/* <HStack>
            <CameraIcon size="20px" color="gray.600" />
            <Select
              placeholder="All cameras"
              value={selectedCamera || ""}
              onChange={(e) => setSelectedCamera(e.target.value || null)}
              variant="filled"
              bg="gray.100"
              borderRadius="md"
              minWidth="200px"
            >
              {cameras?.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </Select>
          </HStack> 
        </HStack> */}

        {/* Search Bar */}
        <HStack width={{ base: "100%", md: "50%" }}>
          <Search size="20px" color="gray.500" />
          <Input
            placeholder="Search objects..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            variant="filled"
            bg="gray.100"
            borderRadius="md"
          />
          {normalizedType !== InfraType.ABNORMALITY ? (
            <Button colorScheme="blue" variant="solid" onClick={onOpen} ml ={4}>
              Add
            </Button>
          ) : null}
          <Button
            leftIcon={<X size={16} />}
            colorScheme="gray"
            variant="outline"
            onClick={handleClearFilters}
            ml={4}
          >
            Clear
          </Button>
        </HStack>
      </Flex>

      <AddObjectModal isOpen={isOpen} onClose={onClose} />

      {/* Table and Pagination */}
      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <>
          {objects && (
            <ObjectTable
              objects={objects.pageData}
              filterCriteria={filterCriteria}
              onFilterChange={setFilterCriteria}
              onClear={handleClearFilters}
            />
          )}
          {objects && (
            <Flex justify="space-between" align="center" mt={2} width="full">
              {/* Display total items and items per page */}
              <Text fontSize="sm" color="gray.600">
                Showing {objects.pageNumber * objects.totalPages + 1} to{" "}
                {Math.min(
                  (objects.pageNumber + 1) * (filterCriteria.size || 10),
                  objects.totalElements
                )}{" "}
                of {objects.totalElements} items
              </Text>
              {/* Items Per Page Selector */}

              {/* Pagination Controls */}
              <Pagination
                currentPage={objects.pageNumber}
                totalPages={objects.totalPages}
                totalItems={objects.totalElements}
                itemsPerPage={filterCriteria.size || 10}
                onPageChange={handlePageChange}
              />
              <HStack>
                <Text fontSize="sm" color="gray.600">
                  Items per page:
                </Text>
                <Select
                  value={filterCriteria.size || 10}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  variant="filled"
                  bg="gray.100"
                  borderRadius="md"
                  width="120px"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={objects.totalElements}>All</option>
                </Select>
              </HStack>
            </Flex>
          )}
        </>
      )}
    </VStack>
  );
};

export default ObjectsPage;
