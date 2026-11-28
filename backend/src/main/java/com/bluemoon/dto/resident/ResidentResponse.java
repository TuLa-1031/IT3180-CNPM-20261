package com.bluemoon.dto.resident;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ResidentResponse(
        Integer id,
        Integer householdId,
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String identityCard,
        String relationshipToOwner,
        String occupation,
        String hometown,
        String residenceStatus,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
