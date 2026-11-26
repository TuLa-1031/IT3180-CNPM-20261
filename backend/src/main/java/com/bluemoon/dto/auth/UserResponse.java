package com.bluemoon.dto.auth;

import java.time.LocalDateTime;

/** Thông tin tài khoản trả ra API — không bao gồm mật khẩu. */
public record UserResponse(
        Integer id,
        String username,
        String fullName,
        String email,
        String phone,
        String role,
        String status,
        Integer residentId,
        LocalDateTime createdAt
) {}
