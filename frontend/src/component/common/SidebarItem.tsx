import { Box, Collapse, Flex, Icon, Text } from "@chakra-ui/react";
import { ChevronDown, ChevronRight } from "react-feather";
import { NavLink, useLocation } from "react-router-dom";
import React, { useState } from "react";

export interface SidebarItemData {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: SidebarItemData[];
}

interface SidebarItemProps {
  item: SidebarItemData;
  selected: boolean;
  textColor: string;
  hoverBgColor: string;
  selectedBgColor: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  selected,
  textColor,
  hoverBgColor,
  selectedBgColor,
}) => {
  const location = useLocation();
  const hasChildren = !!item.children?.length;

  const [isHovering, setIsHovering] = useState(false);

  const isOpen =
    isHovering || (hasChildren && location.pathname.startsWith(item.path));

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Parent item */}
      {hasChildren ? (
        <NavLink to={item.path} style={{ textDecoration: "none" }}>
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3}
            borderRadius="md"
            bg={selected ? selectedBgColor : "transparent"}
            _hover={{ bg: hoverBgColor }}
            color={textColor}
            width="100%"
            cursor="pointer"
          >
            <Flex align="center" gap={3}>
              {item.icon}
              <Text>{item.name}</Text>
            </Flex>
            <Icon
              as={isOpen ? ChevronDown : ChevronRight}
              boxSize={4}
              color="whiteAlpha.600"
            />
          </Flex>
        </NavLink>
      ) : (
        <NavLink to={item.path} style={{ textDecoration: "none" }}>
          <Flex
            align="center"
            px={4}
            py={3}
            borderRadius="md"
            bg={selected ? selectedBgColor : "transparent"}
            _hover={{ bg: hoverBgColor }}
            color={textColor}
            gap={3}
          >
            {item.icon}
            <Text>{item.name}</Text>
          </Flex>
        </NavLink>
      )}

      {/* Submenu */}
      {hasChildren && (
        <Collapse in={isOpen} animateOpacity>
          <Box pl={10} pt={1}>
            {item.children?.map((child, idx) => (
              <NavLink
                to={child.path}
                key={idx}
                style={{ textDecoration: "none" }}
              >
                <Flex
                  align="center"
                  py={2}
                  px={2}
                  borderRadius="md"
                  _hover={{ bg: hoverBgColor }}
                  bg={
                    location.pathname === child.path
                      ? selectedBgColor
                      : "transparent"
                  }
                  color={textColor}
                  gap={2}
                >
                  {child.icon}
                  <Text fontSize="sm">{child.name}</Text>
                </Flex>
              </NavLink>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default SidebarItem;
