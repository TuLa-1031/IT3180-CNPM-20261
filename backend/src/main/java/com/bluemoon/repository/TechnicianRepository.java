package com.bluemoon.repository;

import com.bluemoon.entity.TechnicianEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<TechnicianEntity, Integer> {

    Optional<TechnicianEntity> findByUserId(Integer userId);
}
