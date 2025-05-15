package com.example.infrastructure_service.utils;

import com.example.infrastructure_service.dto.LocationPoint;
import lombok.Data;
import org.locationtech.jts.index.strtree.STRtree;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

import java.util.List;

public class LocationIndex {
  private STRtree tree;
  private GeometryFactory geometryFactory = new GeometryFactory();

  public LocationIndex(List<LocationPoint> points) {
    tree = new STRtree();
    for (LocationPoint p : points) {
      Point point = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(p.getLongitude(), p.getLatitude()));
      tree.insert(point.getEnvelopeInternal(), new IndexedPoint(point, p.getTimestamp()));
    }
    tree.build(); // tối ưu chỉ mục sau khi thêm hết
  }

  public LocationPoint findNearest(double queryLat, double queryLon) {
    Point queryPoint = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(queryLon, queryLat));
    Envelope searchEnv = queryPoint.getEnvelopeInternal();

    // mở rộng hộp tìm kiếm ban đầu một chút nếu cây chưa tìm được gì
    double expansion = 0.0001;

    List<?> results = null;
    while (results == null || results.isEmpty()) {
      searchEnv.expandBy(expansion);
      results = tree.query(searchEnv);
      expansion *= 2;
    }

    // tìm điểm gần nhất thực sự
    IndexedPoint nearest = null;
    double minDistance = Double.MAX_VALUE;
    for (Object obj : results) {
      IndexedPoint ip = (IndexedPoint) obj;
      double dist = ip.point.distance(queryPoint);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = ip;
      }
    }

    LocationPoint locationPoint = new LocationPoint();
    locationPoint.setLatitude(nearest.point.getY());
    locationPoint.setLongitude(nearest.point.getX());
    locationPoint.setTimestamp(nearest.getTimestamp());
    return locationPoint;
  }

  @Data
  private static class IndexedPoint {
    public Point point;
    public long timestamp;

    public IndexedPoint(Point point, long timestamp) {
      this.point = point;
      this.timestamp = timestamp;
    }
  }
}
