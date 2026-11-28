package com.bluemoon.repository;

import com.bluemoon.entity.HouseholdEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseholdRepository extends JpaRepository<HouseholdEntity, Integer> {

    Optional<HouseholdEntity> findByHouseholdCode(String householdCode);

    boolean existsByHouseholdCode(String householdCode);

    @Query("""
            SELECT h FROM HouseholdEntity h
            WHERE (:status IS NULL OR h.status = :status)
              AND (:q IS NULL
                   OR LOWER(h.householdCode) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(h.apartmentNumber) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(h.ownerName) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(h.phone, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY h.id
            """)
    List<HouseholdEntity> search(@Param("q") String query, @Param("status") String status);
}
