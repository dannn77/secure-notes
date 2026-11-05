package com.secure.notes.services;

import com.secure.notes.dtos.UserDTO;
import com.secure.notes.models.Role;
import com.secure.notes.models.User;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserService {
    void updateUserRole(Long userId, String roleName);

    List<User> getAllUsers();

    UserDTO getUserById(Long id);

    User findByUsername(String username);

    void updatePassword(Long userId, String password);

    void changePassword(Long userId, String currentPassword, String newPassword);

    void updateAccountLockStatus(Long userId, boolean lock);

    List<Role> getAllRoles();

    void updateAccountExpiryStatus(Long userId, boolean expire);

    void updateAccountExpiryDate(Long userId, LocalDate expiryDate);

    void updateAccountEnabledStatus(Long userId, boolean enabled);

    void updateCredentialsExpiryStatus(Long userId, boolean expire);

    void generatePasswordResetToken(String email);

    void resetPassword(String token, String newPassword);

    Optional<User> findByEmail(String email);

    User registerUser(User user);

    GoogleAuthenticatorKey generatePending2FASecret(Long userId);

    boolean confirm2FA(Long userId, int code);

    boolean validate2FACode(Long userId, int code);

    void disable2FA(Long userId);
}
