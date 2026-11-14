package com.bluemoon.repository;

import com.bluemoon.entity.HouseholdEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HouseholdRepository extends JpaRepository<HouseholdEntity, Integer> {

    Optional<HouseholdEntity> findByHouseholdCode(String householdCode);

    boolean existsByHouseholdCode(String householdCode);
}
