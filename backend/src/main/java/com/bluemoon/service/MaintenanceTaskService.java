package com.bluemoon.service;

import com.bluemoon.dto.maintenance.MaintenanceTaskResponse;
import com.bluemoon.entity.MaintenanceTaskEntity;
import com.bluemoon.entity.TechnicianEntity;
import com.bluemoon.entity.UserEntity;
import com.bluemoon.exception.BusinessException;
import com.bluemoon.repository.MaintenanceTaskRepository;
import com.bluemoon.repository.TechnicianRepository;
import com.bluemoon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;

    /**
     * Lists maintenance tasks filtered by technician and status.
     * Technicians are restricted to tasks assigned to their own technician profile.
     */
    @Transactional(readOnly = true)
    public List<MaintenanceTaskResponse> findAll(Integer technicianId, String status, String username) {
        Integer effectiveTechnicianId = resolveTechnicianScope(technicianId, username);
        if (effectiveTechnicianId != null && effectiveTechnicianId < 0) {
            return List.of();
        }
        String normalizedStatus = normalize(status);
        return maintenanceTaskRepository.search(effectiveTechnicianId, normalizedStatus).stream()
                .map(this::toResponse)
                .toList();
    }

    private Integer resolveTechnicianScope(Integer requestedTechnicianId, String username) {
        if (username == null) {
            return requestedTechnicianId;
        }
        UserEntity currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser == null || !"TECHNICIAN".equals(currentUser.getRole())) {
            return requestedTechnicianId;
        }
        TechnicianEntity ownProfile = technicianRepository.findByUserId(currentUser.getId()).orElse(null);
        if (ownProfile == null) {
            // Technician account has no linked profile yet, so no tasks should be exposed.
            return -1;
        }
        if (requestedTechnicianId != null && !requestedTechnicianId.equals(ownProfile.getId())) {
            throw new BusinessException("FORBIDDEN", HttpStatus.FORBIDDEN, "Bạn chỉ được xem công việc của mình");
        }
        return ownProfile.getId();
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private MaintenanceTaskResponse toResponse(MaintenanceTaskEntity entity) {
        return new MaintenanceTaskResponse(
                entity.getId(),
                entity.getEquipmentId(),
                entity.getScheduleId(),
                entity.getTechnicianId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getPriority(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getStatus(),
                entity.getResult(),
                entity.getAcceptedBy(),
                entity.getAcceptedAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
