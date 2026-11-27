package com.bluemoon.service;

import com.bluemoon.dto.maintenance.MaintenanceScheduleResponse;
import com.bluemoon.entity.MaintenanceScheduleEntity;
import com.bluemoon.repository.MaintenanceScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceScheduleService {

    private final MaintenanceScheduleRepository maintenanceScheduleRepository;

    /**
     * Lists maintenance schedules filtered by optional equipment ID and planned date range.
     */
    @Transactional(readOnly = true)
    public List<MaintenanceScheduleResponse> findAll(Integer equipmentId, LocalDate from, LocalDate to) {
        return maintenanceScheduleRepository.search(equipmentId, from, to).stream()
                .map(this::toResponse)
                .toList();
    }

    private MaintenanceScheduleResponse toResponse(MaintenanceScheduleEntity entity) {
        return new MaintenanceScheduleResponse(
                entity.getId(),
                entity.getEquipmentId(),
                entity.getPlannedDate(),
                entity.getFrequency(),
                entity.getNote(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
