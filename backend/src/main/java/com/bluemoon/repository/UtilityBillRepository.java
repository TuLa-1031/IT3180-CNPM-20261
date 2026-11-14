package com.bluemoon.repository;

import com.bluemoon.entity.UtilityBillEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtilityBillRepository extends JpaRepository<UtilityBillEntity, Integer> {

    List<UtilityBillEntity> findByHouseholdId(Integer householdId);
}
