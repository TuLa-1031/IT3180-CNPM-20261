package com.bluemoon.dto.resident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ResidentRequest(
        @NotNull Integer householdId,
        @NotBlank @Size(max = 100) String fullName,
        LocalDate dateOfBirth,
        @Size(max = 10) String gender,
        @Size(max = 20) String identityCard,
        @NotBlank @Size(max = 50) String relationshipToOwner,
        @Size(max = 100) String occupation,
        @Size(max = 150) String hometown,
        @NotBlank @Size(max = 30) String residenceStatus,
        String note
) {}
