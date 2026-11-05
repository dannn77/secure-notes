package com.secure.notes.security;

import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TwoFactorAttemptLimiter {
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(5);

    private record Attempts(int count, Instant windowStart) {
        boolean expired() {
            return windowStart.plus(WINDOW).isBefore(Instant.now());
        }
    }

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String username) {
        Attempts current = attempts.get(username);
        return current != null && !current.expired() && current.count() >= MAX_FAILED_ATTEMPTS;
    }

    public void recordFailure(String username) {
        attempts.compute(username, (key, current) ->
                current == null || current.expired()
                        ? new Attempts(1, Instant.now())
                        : new Attempts(current.count() + 1, current.windowStart()));
    }

    public void reset(String username) {
        attempts.remove(username);
    }
}
