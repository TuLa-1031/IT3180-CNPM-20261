package com.bluemoon.repository;

import com.bluemoon.entity.MaintenanceTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTaskEntity, Integer> {

    @Query("""
            SELECT t FROM MaintenanceTaskEntity t
            WHERE (:technicianId IS NULL OR t.technicianId = :technicianId)
              AND (:status IS NULL OR t.status = :status)
            ORDER BY t.id DESC
            """)
    List<MaintenanceTaskEntity> search(@Param("technicianId") Integer technicianId,
                                       @Param("status") String status);
}
