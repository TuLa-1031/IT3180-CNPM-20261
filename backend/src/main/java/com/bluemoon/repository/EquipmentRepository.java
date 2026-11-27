package com.bluemoon.repository;

import com.bluemoon.entity.EquipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<EquipmentEntity, Integer> {

    @Query("""
            SELECT e FROM EquipmentEntity e
            WHERE (:status IS NULL OR e.status = :status)
              AND (:q IS NULL
                   OR LOWER(e.name) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(e.location, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY e.id ASC
            """)
    List<EquipmentEntity> search(@Param("status") String status, @Param("q") String q);
}
