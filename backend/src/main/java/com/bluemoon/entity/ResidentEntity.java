package com.bluemoon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "residents")
@NoArgsConstructor
@AllArgsConstructor
public class ResidentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "household_id", nullable = false)
    private Integer householdId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender = "OTHER";

    @Column(name = "identity_card", unique = true, length = 20)
    private String identityCard;

    @Column(name = "relationship_to_owner", nullable = false, length = 50)
    private String relationshipToOwner;

    @Column(name = "occupation", length = 100)
    private String occupation;

    @Column(name = "hometown", length = 150)
    private String hometown;

    @Column(name = "residence_status", nullable = false, length = 30)
    private String residenceStatus = "PERMANENT";

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

