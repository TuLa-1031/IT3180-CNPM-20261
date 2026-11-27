package com.bluemoon.repository;

import com.bluemoon.entity.MaintenanceScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceScheduleEntity, Integer> {

    @Query("""
            SELECT s FROM MaintenanceScheduleEntity s
            WHERE (:equipmentId IS NULL OR s.equipmentId = :equipmentId)
              AND (:fromDate IS NULL OR s.plannedDate >= :fromDate)
              AND (:toDate IS NULL OR s.plannedDate <= :toDate)
            ORDER BY s.plannedDate ASC, s.id ASC
            """)
    List<MaintenanceScheduleEntity> search(@Param("equipmentId") Integer equipmentId,
                                           @Param("fromDate") LocalDate fromDate,
                                           @Param("toDate") LocalDate toDate);
}
