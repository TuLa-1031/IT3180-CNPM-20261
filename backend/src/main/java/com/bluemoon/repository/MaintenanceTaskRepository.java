package com.bluemoon.repository;

import com.bluemoon.entity.MaintenanceTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTaskEntity, Integer> {
}
