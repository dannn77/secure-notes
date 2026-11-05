package com.secure.notes.security;

import com.secure.notes.models.User;
import com.secure.notes.repositories.UserRepository;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LoginAttemptService {
    public static final int MAX_FAILED_ATTEMPTS = 5;
    public static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;

    public LoginAttemptService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void unlockIfLockExpired(String username) {
        userRepository.findByUserName(username)
                .filter(user -> !user.isAccountNonLocked() && user.getLockTime() != null)
                .filter(user -> lockEnd(user).isBefore(LocalDateTime.now()))
                .ifPresent(user -> {
                    user.setAccountNonLocked(true);
                    user.setLockTime(null);
                    user.setFailedLoginAttempts(0);
                    userRepository.save(user);
                });
    }

    public boolean recordFailure(String username) {
        Optional<User> found = userRepository.findByUserName(username);
        if (found.isEmpty() || !found.get().isAccountNonLocked())
            return false;
        User user = found.get();
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
        boolean lockedNow = user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS;
        if (lockedNow) {
            user.setAccountNonLocked(false);
            user.setLockTime(LocalDateTime.now());
        }
        userRepository.save(user);
        return lockedNow;
    }

    public void recordSuccess(String username) {
        userRepository.findByUserName(username)
                .filter(user -> user.getFailedLoginAttempts() > 0)
                .ifPresent(user -> {
                    user.setFailedLoginAttempts(0);
                    userRepository.save(user);
                });
    }

    public Optional<LocalDateTime> temporaryLockEnd(String username) {
        return userRepository.findByUserName(username)
                .filter(user -> !user.isAccountNonLocked() && user.getLockTime() != null)
                .map(LoginAttemptService::lockEnd);
    }

    private static LocalDateTime lockEnd(User user) {
        return user.getLockTime().plus(LOCK_DURATION);
    }
}
