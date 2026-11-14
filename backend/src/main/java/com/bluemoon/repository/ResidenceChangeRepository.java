package com.bluemoon.repository;

import com.bluemoon.entity.ResidenceChangeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidenceChangeRepository extends JpaRepository<ResidenceChangeEntity, Integer> {

    List<ResidenceChangeEntity> findByResidentId(Integer residentId);

    List<ResidenceChangeEntity> findByHouseholdId(Integer householdId);
}
