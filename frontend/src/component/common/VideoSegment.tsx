import React, { useRef, useEffect, forwardRef } from "react";
import {
  Box,
  Text,
} from "@chakra-ui/react";

// Định nghĩa kiểu props, kế thừa từ HTMLVideoElement
interface VideoSegmentProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;           // URL của video
  startTime: number;     // Thời gian bắt đầu (giây)
  endTime: number;       // Thời gian kết thúc (giây)
}

// Sử dụng forwardRef để truyền ref vào thẻ video
const VideoSegment = forwardRef<HTMLVideoElement, VideoSegmentProps>(
  ({ src, startTime, endTime, width = "100%", height = "300px", ...videoProps }, ref) => {
    const internalRef = useRef<HTMLVideoElement>(null);
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalRef;

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !src) return;

      // Đặt thời gian bắt đầu
      video.currentTime = startTime;

      const handleTimeUpdate = () => {
        if (video.currentTime >= endTime) {
          video.pause(); // Dừng video khi đến endTime
          video.currentTime = startTime; // Tua lại về startTime
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);

      // Cleanup khi component unmount hoặc src thay đổi
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }, [src, startTime, endTime, videoRef]);

    return (
      <Box>
        {src ? (
          <video
            autoPlay
            ref={videoRef}
            src={src}
            controls
            width={width}
            height={height}
            style={{ objectFit: "contain" }}
            {...videoProps} // Truyền tất cả các props khác của thẻ video
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Box
            width={width}
            height={height}
            bg="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
          >
            <Text color="gray.500">No video available</Text>
          </Box>
        )}
      </Box>
    );
  }
);

export default VideoSegment;