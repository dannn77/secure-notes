package com.secure.notes.security;

import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

@Component
public class ContactMessageLimiter {
    private static final int MAX_MESSAGES = 20;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final Deque<Instant> sentAt = new ArrayDeque<>();

    public synchronized boolean tryAcquire() {
        Instant windowStart = Instant.now().minus(WINDOW);
        while (!sentAt.isEmpty() && sentAt.peekFirst().isBefore(windowStart))
            sentAt.pollFirst();
        if (sentAt.size() >= MAX_MESSAGES)
            return false;
        sentAt.addLast(Instant.now());
        return true;
    }
}
