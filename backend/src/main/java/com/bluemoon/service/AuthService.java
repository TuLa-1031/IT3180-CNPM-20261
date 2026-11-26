package com.bluemoon.service;

import com.bluemoon.dto.ErrorResponse;
import com.bluemoon.dto.auth.AuthResponse;
import com.bluemoon.dto.auth.ChangePasswordRequest;
import com.bluemoon.dto.auth.LoginRequest;
import com.bluemoon.dto.auth.UserResponse;
import com.bluemoon.entity.UserEntity;
import com.bluemoon.exception.BusinessException;
import com.bluemoon.exception.ResourceNotFoundException;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "Tên đăng nhập hoặc mật khẩu không đúng";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new BusinessException(
                        "INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BusinessException("ACCOUNT_LOCKED", HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException("INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE);
        }

        return new AuthResponse(jwtTokenProvider.generateToken(user), toUserResponse(user));
    }

    public UserResponse currentUser(String username) {
        return toUserResponse(findUser(username));
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        UserEntity user = findUser(username);

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BusinessException("VALIDATION_ERROR", HttpStatus.BAD_REQUEST,
                    "Mật khẩu hiện tại không đúng",
                    List.of(new ErrorResponse.FieldError("oldPassword", "Mật khẩu hiện tại không đúng")));
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BusinessException("VALIDATION_ERROR", HttpStatus.BAD_REQUEST,
                    "Mật khẩu mới phải khác mật khẩu hiện tại",
                    List.of(new ErrorResponse.FieldError("newPassword", "Mật khẩu mới phải khác mật khẩu hiện tại")));
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private UserEntity findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
    }

    private UserResponse toUserResponse(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getResidentId(),
                user.getCreatedAt()
        );
    }
}
