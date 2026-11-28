package com.bluemoon.dto.change;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ResidenceChangeResponse(
        Integer id,
        Integer residentId,
        Integer householdId,
        String changeType,
        LocalDate startDate,
        LocalDate endDate,
        String destinationOrOrigin,
        String reason,
        Integer createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
