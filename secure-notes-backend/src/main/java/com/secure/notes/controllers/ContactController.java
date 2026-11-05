package com.secure.notes.controllers;

import com.secure.notes.dtos.ContactRequest;
import com.secure.notes.security.ContactMessageLimiter;
import com.secure.notes.security.response.MessageResponse;
import com.secure.notes.util.EmailService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContactController {
    private static final Logger logger = LoggerFactory.getLogger(ContactController.class);

    private final EmailService emailService;
    private final ContactMessageLimiter contactMessageLimiter;

    public ContactController(EmailService emailService, ContactMessageLimiter contactMessageLimiter) {
        this.emailService = emailService;
        this.contactMessageLimiter = contactMessageLimiter;
    }

    @PostMapping("/api/contact")
    public ResponseEntity<MessageResponse> sendContactMessage(@Valid @RequestBody ContactRequest request) {
        if (!contactMessageLimiter.tryAcquire()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new MessageResponse("Too many messages right now, please try again later"));
        }
        try {
            emailService.sendContactMessage(request.getName(), request.getEmail(), request.getMessage());
        } catch (MailException e) {
            logger.error("Failed to send contact message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("We couldn't send your message, please try again later"));
        }
        return ResponseEntity.ok(new MessageResponse("Message sent"));
    }
}
