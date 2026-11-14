package com.bluemoon.service;

import com.bluemoon.entity.ResidentEntity;
import com.bluemoon.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidentService {

    private final ResidentRepository residentRepository;

    public List<ResidentEntity> findAll() {
        return residentRepository.findAll();
    }
}

