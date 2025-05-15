package com.example.camera_service.repository;

import com.example.camera_service.utils.SchedulingStatus;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.camera_service.entity.Scheduling;

@Repository
public interface SchedulingRepository extends JpaRepository<Scheduling, String> {
    @Query(value = """
    SELECT scheduling.*
    FROM scheduling, camera_user
    WHERE scheduling.camera_id = camera_user.camera_id
      and user_id = :credentialId
      and (COALESCE(:cameraId, '') = '' OR scheduling.camera_id = :cameraId)
      AND (COALESCE(:endTime, '') = '' OR end_time <= :endTime)
      AND (COALESCE(:startTime, '') = '' OR start_time >= :startTime)
      AND (COALESCE(:status, '') = '' OR scheduling_status = :status)
    ORDER BY 
      start_time DESC
""", nativeQuery = true)
    List<Scheduling> getScheduleByFilter(
        @Param("startTime") String startTime,
        @Param("endTime") String endTime,
        @Param("cameraId") String cameraId,
        @Param("status") String status,
        String credentialId
    );

    @Query("select s from Scheduling s where s.camera.id = :cameraId order by s.startTime desc ")
    List<Scheduling> getSchedulingByCamera(String cameraId);
}
