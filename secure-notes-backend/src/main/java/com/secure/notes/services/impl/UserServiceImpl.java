package com.secure.notes.services.impl;

import com.secure.notes.dtos.UserDTO;
import com.secure.notes.models.AppRole;
import com.secure.notes.models.PasswordResetToken;
import com.secure.notes.models.Role;
import com.secure.notes.models.User;
import com.secure.notes.repositories.PasswordResetTokenRepository;
import com.secure.notes.repositories.RoleRepository;
import com.secure.notes.repositories.UserRepository;
import com.secure.notes.security.LoginAttemptService;
import com.secure.notes.services.TotpService;
import com.secure.notes.services.UserService;
import com.secure.notes.util.EmailService;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {
    private static final Period CREDENTIALS_VALIDITY = Period.ofYears(1);

    @Value("${frontend.url}")
    String frontendUrl;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    EmailService emailService;

    @Autowired
    TotpService totpService;

    @Override
    public void updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        AppRole appRole = AppRole.valueOf(roleName);
        Role role = roleRepository.findByRoleName(appRole)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        return convertToDto(user);
    }

    private UserDTO convertToDto(User user) {
        LocalDateTime lockedUntil = user.getLockTime() == null
                ? null
                : user.getLockTime().plus(LoginAttemptService.LOCK_DURATION);
        boolean temporaryLockOver = lockedUntil != null && lockedUntil.isBefore(LocalDateTime.now());
        return new UserDTO(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.isAccountNonLocked() || temporaryLockOver,
                user.isAccountNonExpired(),
                user.isCredentialsNonExpired(),
                user.isEnabled(),
                user.getCredentialsExpiryDate(),
                user.getAccountExpiryDate(),
                user.isTwoFactorEnabled(),
                user.getSignUpMethod(),
                user.getRole(),
                user.getCreatedDate(),
                user.getUpdatedDate(),
                temporaryLockOver ? null : lockedUntil
        );
    }

    @Override
    public User findByUsername(String username) {
        Optional<User> user = userRepository.findByUserName(username);
        return user.orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @Override
    public void updatePassword(Long userId, String password) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            applyNewPassword(user, password);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update password");
        }
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getPassword() == null)
            throw new IllegalArgumentException("This account signs in with Google or GitHub and has no password");
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new IllegalArgumentException("Current password is incorrect");
        validateNewPassword(newPassword);
        applyNewPassword(user, newPassword);
        userRepository.save(user);
    }

    private void validateNewPassword(String newPassword) {
        if (newPassword == null || newPassword.length() < 6 || newPassword.length() > 40)
            throw new IllegalArgumentException("New password must be between 6 and 40 characters");
    }

    private void applyNewPassword(User user, String rawPassword) {
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setCredentialsNonExpired(true);
        user.setCredentialsExpiryDate(LocalDate.now().plus(CREDENTIALS_VALIDITY));
    }

    @Override
    public void updateAccountLockStatus(Long userId, boolean lock) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found"));
        user.setAccountNonLocked(!lock);
        user.setLockTime(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public void updateAccountExpiryStatus(Long userId, boolean expire) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found"));
        user.setAccountNonExpired(!expire);
        LocalDate expiryDate = user.getAccountExpiryDate();
        if (!expire && expiryDate != null && expiryDate.isBefore(LocalDate.now()))
            user.setAccountExpiryDate(null);
        userRepository.save(user);
    }

    @Override
    public void updateAccountExpiryDate(Long userId, LocalDate expiryDate) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found"));
        user.setAccountExpiryDate(expiryDate);
        userRepository.save(user);
    }

    @Override
    public void updateAccountEnabledStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    @Override
    public void updateCredentialsExpiryStatus(Long userId, boolean expire) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found"));
        user.setCredentialsNonExpired(!expire);
        LocalDate expiryDate = user.getCredentialsExpiryDate();
        if (!expire && expiryDate != null && expiryDate.isBefore(LocalDate.now()))
            user.setCredentialsExpiryDate(LocalDate.now().plus(CREDENTIALS_VALIDITY));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void generatePasswordResetToken(String email) {
        Optional<User> found = userRepository.findByEmail(email);
        if (found.isEmpty())
            return;
        User user = found.get();

        passwordResetTokenRepository.invalidateAllForUser(user);

        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(24, ChronoUnit.HOURS);
        PasswordResetToken resetToken = new PasswordResetToken(token, expiryDate, user);
        passwordResetTokenRepository.save(resetToken);

        String resetUrl = frontendUrl +  "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() ->  new RuntimeException("Invalid password reset token"));

        if(resetToken.isUsed())
            throw new RuntimeException("Password reset token has already been used");

        if(resetToken.getExpiryDate().isBefore(Instant.now()))
            throw new RuntimeException("Password reset token has expired");

        validateNewPassword(newPassword);

        User user = resetToken.getUser();
        applyNewPassword(user, newPassword);
        userRepository.save(user);

        passwordResetTokenRepository.invalidateAllForUser(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User registerUser(User user) {
        if(user.getPassword() != null)
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public GoogleAuthenticatorKey generatePending2FASecret(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isTwoFactorEnabled())
            throw new IllegalStateException("Two-factor authentication is already enabled");
        GoogleAuthenticatorKey key = totpService.generateSecret();
        user.setPendingTwoFactorSecret(key.getKey());
        userRepository.save(user);
        return key;
    }

    @Override
    public boolean confirm2FA(Long userId, int code) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isTwoFactorEnabled() || !totpService.verifyCode(user.getPendingTwoFactorSecret(), code))
            return false;
        user.setTwoFactorSecret(user.getPendingTwoFactorSecret());
        user.setPendingTwoFactorSecret(null);
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean validate2FACode(Long userId, int code) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return user.isTwoFactorEnabled() && totpService.verifyCode(user.getTwoFactorSecret(), code);
    }

    @Override
    public void disable2FA(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setPendingTwoFactorSecret(null);
        userRepository.save(user);
    }
}
