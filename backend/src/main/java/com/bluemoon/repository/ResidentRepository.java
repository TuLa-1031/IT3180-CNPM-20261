package com.bluemoon.repository;

import com.bluemoon.entity.ResidentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidentRepository extends JpaRepository<ResidentEntity, Integer> {

    List<ResidentEntity> findByHouseholdId(Integer householdId);
}
