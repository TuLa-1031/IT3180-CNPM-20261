package com.bluemoon.service;

import com.bluemoon.entity.VehicleEntity;
import com.bluemoon.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<VehicleEntity> findAll() {
        return vehicleRepository.findAll();
    }
}

