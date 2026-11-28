package com.bluemoon.repository;

import com.bluemoon.entity.ResidenceChangeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidenceChangeRepository extends JpaRepository<ResidenceChangeEntity, Integer> {

    List<ResidenceChangeEntity> findByResidentId(Integer residentId);

    List<ResidenceChangeEntity> findByHouseholdId(Integer householdId);

    @Query("""
            SELECT c FROM ResidenceChangeEntity c
            WHERE (:householdId IS NULL OR c.householdId = :householdId)
              AND (:changeType IS NULL OR c.changeType = :changeType)
            ORDER BY c.startDate DESC, c.id DESC
            """)
    List<ResidenceChangeEntity> search(
            @Param("householdId") Integer householdId,
            @Param("changeType") String changeType
    );
}
