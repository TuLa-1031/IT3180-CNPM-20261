package com.bluemoon.dto.change;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResidenceChangeRequest(
        @NotNull Integer residentId,
        @NotNull Integer householdId,
        @NotBlank @Size(max = 30) String changeType,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        @Size(max = 255) String destinationOrOrigin,
        String reason
) {}
