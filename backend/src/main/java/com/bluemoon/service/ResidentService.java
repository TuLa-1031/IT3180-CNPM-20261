package com.bluemoon.service;

import com.bluemoon.dto.resident.ResidentResponse;
import com.bluemoon.entity.ResidentEntity;
import com.bluemoon.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidentService {

    private final ResidentRepository residentRepository;

    @Transactional(readOnly = true)
    public List<ResidentResponse> findAll(Integer householdId, String query, String status) {
        return residentRepository.search(householdId, normalize(query), normalize(status)).stream()
                .map(this::toResponse)
                .toList();
    }

    private ResidentResponse toResponse(ResidentEntity resident) {
        return new ResidentResponse(
                resident.getId(),
                resident.getHouseholdId(),
                resident.getFullName(),
                resident.getDateOfBirth(),
                resident.getGender(),
                resident.getIdentityCard(),
                resident.getRelationshipToOwner(),
                resident.getOccupation(),
                resident.getHometown(),
                resident.getResidenceStatus(),
                resident.getNote(),
                resident.getCreatedAt(),
                resident.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

