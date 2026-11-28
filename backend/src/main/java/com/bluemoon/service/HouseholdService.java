package com.bluemoon.service;

import com.bluemoon.dto.household.HouseholdResponse;
import com.bluemoon.entity.HouseholdEntity;
import com.bluemoon.repository.HouseholdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseholdService {

    private final HouseholdRepository householdRepository;

    @Transactional(readOnly = true)
    public List<HouseholdResponse> findAll(String query, String status) {
        return householdRepository.search(normalize(query), normalize(status)).stream()
                .map(this::toResponse)
                .toList();
    }

    private HouseholdResponse toResponse(HouseholdEntity household) {
        return new HouseholdResponse(
                household.getId(),
                household.getHouseholdCode(),
                household.getApartmentNumber(),
                household.getFloor(),
                household.getArea(),
                household.getOwnerName(),
                household.getPhone(),
                household.getMoveInDate(),
                household.getStatus(),
                household.getCreatedAt(),
                household.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

