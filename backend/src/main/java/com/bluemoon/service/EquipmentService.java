package com.bluemoon.service;

import com.bluemoon.dto.maintenance.EquipmentResponse;
import com.bluemoon.entity.EquipmentEntity;
import com.bluemoon.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    /**
     * Lists equipment filtered by optional status and search query (name or location).
     */
    @Transactional(readOnly = true)
    public List<EquipmentResponse> findAll(String status, String q) {
        String normalizedStatus = normalize(status);
        String normalizedQuery = normalize(q);
        return equipmentRepository.search(normalizedStatus, normalizedQuery).stream()
                .map(this::toResponse)
                .toList();
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private EquipmentResponse toResponse(EquipmentEntity entity) {
        return new EquipmentResponse(
                entity.getId(),
                entity.getName(),
                entity.getLocation(),
                entity.getStatus(),
                entity.getInstalledAt(),
                entity.getNote(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
