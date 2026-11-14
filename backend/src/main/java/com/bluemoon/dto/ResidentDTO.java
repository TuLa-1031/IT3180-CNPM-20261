package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResidentDTO {
    private Integer id;
    private Integer householdId;
    private String householdCode;
    private String apartmentNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String identityCard;
    private String relationshipToOwner;
    private String occupation;
    private String hometown;
    private String residenceStatus;
    private String note;
}

