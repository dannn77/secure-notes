package com.secure.notes.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${contact.recipient}")
    private String contactRecipient;

    public void sendPasswordResetEmail(String to, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("Click the link to reset your password: " + resetUrl);
        mailSender.send(message);
    }

    public void sendContactMessage(String name, String email, String text) {
        String senderName = name.replaceAll("[\\r\\n]+", " ").trim();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(contactRecipient);
        message.setReplyTo(email);
        message.setSubject("SecureNotes contact form: " + senderName);
        message.setText("From: " + senderName + " <" + email + ">\n\n" + text);
        mailSender.send(message);
    }
}
