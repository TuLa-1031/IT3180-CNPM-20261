package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Không trả về mật khẩu ra API
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}

