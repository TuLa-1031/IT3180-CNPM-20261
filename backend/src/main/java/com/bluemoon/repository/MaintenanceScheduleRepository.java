package com.bluemoon.repository;

import com.bluemoon.entity.MaintenanceScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceScheduleEntity, Integer> {
}
