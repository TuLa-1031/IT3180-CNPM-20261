package com.bluemoon.repository;

import com.bluemoon.entity.FeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeRepository extends JpaRepository<FeeEntity, Integer> {

    Optional<FeeEntity> findByFeeCode(String feeCode);

    List<FeeEntity> findByStatus(String status);
}
