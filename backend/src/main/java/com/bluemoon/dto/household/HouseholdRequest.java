package com.bluemoon.dto.household;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HouseholdRequest(
        @NotBlank @Size(max = 20) String householdCode,
        @NotBlank @Size(max = 20) String apartmentNumber,
        @NotNull @Min(1) @Max(50) Integer floor,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal area,
        @NotBlank @Size(max = 100) String ownerName,
        @Size(max = 20) String phone,
        LocalDate moveInDate,
        @NotBlank @Size(max = 20) String status
) {}
