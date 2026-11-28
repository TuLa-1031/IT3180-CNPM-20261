package com.bluemoon.repository;

import com.bluemoon.entity.ResidentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidentRepository extends JpaRepository<ResidentEntity, Integer> {

    List<ResidentEntity> findByHouseholdId(Integer householdId);

    @Query("""
            SELECT r FROM ResidentEntity r
            WHERE (:householdId IS NULL OR r.householdId = :householdId)
              AND (:status IS NULL OR r.residenceStatus = :status)
              AND (:q IS NULL
                   OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(r.identityCard, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR EXISTS (
                       SELECT h.id FROM HouseholdEntity h
                       WHERE h.id = r.householdId
                         AND (LOWER(h.householdCode) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(h.apartmentNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(h.ownerName) LIKE LOWER(CONCAT('%', :q, '%')))
                   ))
            ORDER BY r.id
            """)
    List<ResidentEntity> search(
            @Param("householdId") Integer householdId,
            @Param("q") String query,
            @Param("status") String status
    );
}
