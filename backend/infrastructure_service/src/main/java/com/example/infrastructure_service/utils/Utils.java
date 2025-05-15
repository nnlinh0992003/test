package com.example.infrastructure_service.utils;

import ch.hsr.geohash.GeoHash;
import com.example.infrastructure_service.dto.LocationPoint;
import com.example.infrastructure_service.enums.InfraStatus;
import com.example.infrastructure_service.enums.InfraType;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class Utils {

  private static final double EARTH_RADIUS_METERS = 6371008.8;

  private static final String[] ALLOWED_IMAGE_TYPES = {
      "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"
  };

  private static final DateTimeFormatter INPUT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
  private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  public static String getStartHour(String startTimeStr) {
    LocalDateTime start = LocalDateTime.parse(startTimeStr, INPUT_FORMATTER);
    return start.format(TIME_FORMATTER);
  }

  public static String getDate(String timeStr) {
    LocalDateTime time = LocalDateTime.parse(timeStr, INPUT_FORMATTER);
    return time.format(DATE_FORMATTER);
  }

  public static Double calculateDistanceInMeters(double lat1, double lon1, double lat2, double lon2) {
    double latDistance = Math.toRadians(lat2 - lat1);
    double lonDistance = Math.toRadians(lon2 - lon1);
    double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
        + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    double distance = EARTH_RADIUS_METERS * c;
    // Làm tròn 4 chữ số thập phân
    return new BigDecimal(distance).setScale(4, RoundingMode.HALF_UP).doubleValue();
  }

  public static String generateGeoHash(double latitude, double longitude, int precision) {
    return GeoHash.withCharacterPrecision(latitude, longitude, precision).toBase32();
  }

  public static boolean isAllowedImageType(String contentType) {
    for (String type : ALLOWED_IMAGE_TYPES) {
      if (type.equals(contentType)) {
        return true;
      }
    }
    return false;
  }

  public static String buildLinestringWKT(List<LocationPoint> points) {
    return "LINESTRING(" +
        points.stream()
            .map(p -> p.getLongitude() + " " + p.getLatitude())
            .collect(Collectors.joining(", ")) +
        ")";

  }

  public static Integer loadLevel(InfraType type, String status, Double width, Double height) {

    if(type == InfraType.ASSET){
      if(Objects.equals(status, "OK")){
        return 0;
      }else if (Objects.equals(status, "NOT OK")){
        return 1;
      }else if(Objects.equals(status, "LOST")) return 2;
      return -1;
    }

    if (type == InfraType.ABNORMALITY){
      double area = width * height;

      boolean longSide = width > 1500 || height > 1500;
      boolean mediumLong = width > 1000 || height > 1000;

      if (area > 1000000 || longSide) {
        return 3;
      } else if (area >= 500000 || mediumLong) {
        return 2;
      } else {
        return 1;
      }

    }

    return -1;

  }

}
