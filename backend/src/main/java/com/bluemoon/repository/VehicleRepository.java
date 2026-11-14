package com.bluemoon.repository;

import com.bluemoon.entity.VehicleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<VehicleEntity, Integer> {

    List<VehicleEntity> findByHouseholdId(Integer householdId);

    Optional<VehicleEntity> findByLicensePlate(String licensePlate);
}
