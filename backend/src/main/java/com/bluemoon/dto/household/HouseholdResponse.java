package com.bluemoon.dto.household;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record HouseholdResponse(
        Integer id,
        String householdCode,
        String apartmentNumber,
        Integer floor,
        BigDecimal area,
        String ownerName,
        String phone,
        LocalDate moveInDate,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
