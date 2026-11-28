package com.bluemoon.service;

import com.bluemoon.dto.change.ResidenceChangeResponse;
import com.bluemoon.entity.ResidenceChangeEntity;
import com.bluemoon.repository.ResidenceChangeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenceChangeService {

    private final ResidenceChangeRepository residenceChangeRepository;

    @Transactional(readOnly = true)
    public List<ResidenceChangeResponse> findAll(Integer householdId, String changeType) {
        return residenceChangeRepository.search(householdId, normalize(changeType)).stream()
                .map(this::toResponse)
                .toList();
    }

    private ResidenceChangeResponse toResponse(ResidenceChangeEntity change) {
        return new ResidenceChangeResponse(
                change.getId(),
                change.getResidentId(),
                change.getHouseholdId(),
                change.getChangeType(),
                change.getStartDate(),
                change.getEndDate(),
                change.getDestinationOrOrigin(),
                change.getReason(),
                change.getCreatedBy(),
                change.getCreatedAt(),
                change.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

