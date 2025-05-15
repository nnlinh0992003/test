import { Text, Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Image, useDisclosure, Input, Select, Flex, Button, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, HStack } from "@chakra-ui/react";
import { InfraObject, InfraStatus, InfraCategory, ObjectFilterRequest } from "../../type/models";
import { formatDate, getStatusColor } from "../../type/utils";
import React, { useState, useEffect, useRef } from "react";
import ObjectDetailsModal from "./ObjectDetailsModal";
import { Edit, Trash, X } from "react-feather";
import { useDeleteFakeEventMutation, useDeleteInfrastructureObjectMutation, useUpdateInfrastructureObjectMutation } from "../../redux/service/infrastructure";
import EditObjectModal from "./EditObjectModal";
import { useNavigate } from "react-router-dom";
import useCustomToast from "../../hook/useCustomToast";

interface ObjectTableProps {
  objects: InfraObject[];
  filterCriteria: ObjectFilterRequest;
  onFilterChange: (filterCriteria: ObjectFilterRequest) => void;
  onClear: () => void;
}

const ObjectTable: React.FC<ObjectTableProps> = ({ objects, onFilterChange, filterCriteria, onClear }) => {
  const [deleteObject] = useDeleteInfrastructureObjectMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
  const [selectedObject, setSelectedObject] = useState<InfraObject | null>(null);
  const [objectToDelete, setObjectToDelete] = useState<InfraObject | null>(null);
  const [filteredObjects, setFilteredObjects] = useState<InfraObject[]>(objects);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const toast = useCustomToast();

  useEffect(() => {
    setFilteredObjects(objects);
  }, [objects]);

  const handleEditRow = (obj: InfraObject) => {
    setSelectedObject(obj);
    onOpenEdit();
  };

  const handleRowClick = (obj: InfraObject) => {
    navigate(`/infrastructure/${obj.id}`);
  };

  const handleDeleteClick = (obj: InfraObject, e: React.MouseEvent) => {
    e.stopPropagation();
    setObjectToDelete(obj);
    onOpenDelete();
  };

  const confirmDelete = () => {
    if (objectToDelete) {
      deleteObject(objectToDelete.id);
      setObjectToDelete(null);
      onCloseDelete();
      toast("Delete", "Delete object successfully", "success");
    }
  };

  const handleFilterChange = (field: keyof typeof filterCriteria, value: any) => {
    onFilterChange({ ...filterCriteria, [field]: value, page: 0 });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const formattedDate = dateValue.split("T")[0];
      handleFilterChange("dateCaptured", formattedDate);
    } else {
      handleFilterChange("dateCaptured", "");
    }
  };

  return (
    <Box height="full" overflowY="auto">
      <Box overflowX="auto">
        <Table
          variant="simple"
          sx={{
            tableLayout: { base: "auto", md: "fixed" }, // Tắt tableLayout: fixed trên màn hình nhỏ
            minWidth: "1300px", // Đảm bảo bảng có chiều rộng tối thiểu
            borderCollapse: "separate",
            borderSpacing: "0",
            "& th, & td": {
              borderWidth: "1px",
              borderColor: "gray.200",
              padding: { base: "10px", md: "20px" }, // Giảm padding trên màn hình nhỏ
            },
          }}
        >
          <Thead bg="gray.100" position="sticky" top="0" zIndex={1}>
            <Tr>
              <Th width={{ base: "150px", md: "17%" }} textAlign="center">
                Id
                <Input
                  size="sm"
                  placeholder="Filter by keyId..."
                  value={filterCriteria.keyId || ""}
                  onChange={(e) => handleFilterChange("keyId", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                />
              </Th>
              <Th width={{ base: "150px", md: "15%" }} textAlign="center">
                Name
                <Input
                  size="sm"
                  placeholder="Filter name..."
                  value={filterCriteria.name || ""}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                />
              </Th>
              <Th width={{ base: "150px", md: "15%" }} textAlign="center">
                Category
                <Select
                  size="sm"
                  placeholder="All"
                  value={filterCriteria.category || ""}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                >
                  {Object.values(InfraCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Th>
              <Th width={{ base: "150px", md: "20%" }} textAlign="center">
                Last Updated
                <Input
                  size="sm"
                  placeholder="Filter date..."
                  value={filterCriteria.dateCaptured || ""}
                  onChange={handleDateChange}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                  type="date"
                />
              </Th>
              <Th width={{ base: "150px", md: "40%" }} textAlign="center">
                Location
                <Input
                  size="sm"
                  placeholder="Filter location..."
                  value={filterCriteria.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                />
              </Th>
              <Th width={{ base: "100px", md: "10%" }} textAlign="center">
                Status
                <Select
                  size="sm"
                  placeholder="All"
                  value={filterCriteria.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  mt={2}
                  bg="white"
                  borderRadius="md"
                >
                  {Object.values(InfraStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </Th>
              <Th width={{ base: "100px", md: "15%" }} textAlign="center">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredObjects.length > 0 ? (
              filteredObjects.map((obj) => (
                <Tr
                  key={obj.id}
                  onClick={() => handleRowClick(obj)}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  transition="background-color 0.2s"
                >
                  <Td width={{ base: "150px", md: "250px" }} textAlign="center">
                    <Box as="span" display="block" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {obj?.info?.keyId}
                    </Box>
                  </Td>
                  <Td width={{ base: "150px", md: "250px" }} textAlign="center">
                    <Box as="span" display="block" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {obj.name}
                    </Box>
                  </Td>
                  <Td width={{ base: "150px", md: "250px" }} textAlign="center">
                    <Box as="span" display="block" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {obj.category}
                    </Box>
                  </Td>
                  <Td width={{ base: "150px", md: "280px" }} textAlign="center">
                    <Box as="span" display="block" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {formatDate(obj.dateCaptured)}
                    </Box>
                  </Td>
                  <Td width={{ base: "150px", md: "280px" }} textAlign="center">
                    <Box as="span" display="block" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {obj.location}
                    </Box>
                  </Td>
                  <Td width={{ base: "100px", md: "250px" }} textAlign="center">
                    <Badge colorScheme={getStatusColor(obj.status)}>
                      {obj.status}
                    </Badge>
                  </Td>
                  <Td width={{ base: "100px", md: "150px" }} textAlign="center" onClick={(e) => e.stopPropagation()}>
                    <Flex gap={2} justify="center" direction={{ base: "column", md: "row" }}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEditRow(obj)}
                        leftIcon={<Edit size={16} />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(obj, e)}
                        leftIcon={<Trash size={16} />}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center" py={4}>
                  No matching objects found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Object Details Modal */}
      {selectedObject && (
        <ObjectDetailsModal isOpen={isOpen} onClose={onClose} obj={selectedObject} />
      )}

      {/* Edit Object Modal */}
      {selectedObject && (
        <EditObjectModal isOpen={isEditOpen} onClose={onCloseEdit} objectId={selectedObject?.id} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onCloseDelete}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Infrastructure Object
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{objectToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDelete}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ObjectTable;