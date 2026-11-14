package com.bluemoon.service;

import com.bluemoon.entity.HouseholdEntity;
import com.bluemoon.repository.HouseholdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseholdService {

    private final HouseholdRepository householdRepository;

    public List<HouseholdEntity> findAll() {
        return householdRepository.findAll();
    }
}

