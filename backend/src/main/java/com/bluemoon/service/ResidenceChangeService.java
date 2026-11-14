package com.bluemoon.service;

import com.bluemoon.entity.ResidenceChangeEntity;
import com.bluemoon.repository.ResidenceChangeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenceChangeService {

    private final ResidenceChangeRepository residenceChangeRepository;

    public List<ResidenceChangeEntity> findAll() {
        return residenceChangeRepository.findAll();
    }
}

