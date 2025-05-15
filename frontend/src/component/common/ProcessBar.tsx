import { Box, Image } from "@chakra-ui/react";
import Background from "../../assets/image.png"
 
export const NyanCatProgressBar: React.FC = () => {
  return (
    <Box
        bgImage={Background}
          backgroundSize="cover"
      borderRadius="lg"
      boxShadow="md"
      h="25px"
      w="100%"
      maxW="200px"
      position="relative"
      overflow="hidden"
      borderColor="blackAlpha.200"
      role="progressbar"
      aria-label="Nyan Cat on Rainbow"
    >
      <Image
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExazg5NTkxZDVvdWxqcHJkOXQ0ZHh1NHgxZ3pvdWUzM25wYXo3OGo0ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7lsw8RenVcjCM/giphy.gif"
        alt="Nyan Cat"
        h="25px"
        w="50px"
        position="absolute"
        top="50%"
        transform="translateY(-50%)"
        sx={{
          animation: "nyanCatRun 30s linear infinite",
          "@keyframes nyanCatRun": {
            "0%": {
              left: "0%",
              transform: "translateY(-50%) scaleX(1)",
            },
            "50%": {
              left: "calc(100% - 50px)",
              transform: "translateY(-50%) scaleX(1)",
            },
            "50.1%": {
              left: "calc(100% - 50px)",
              transform: "translateY(-50%) scaleX(-1)",
            },
            "100%": {
              left: "0%",
              transform: "translateY(-50%) scaleX(-1)",
            },
          },
        }}
      />
    </Box>
  );
};