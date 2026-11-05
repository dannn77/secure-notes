package com.secure.notes.repositories;

import com.secure.notes.models.PasswordResetToken;
import com.secure.notes.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    @Query("update PasswordResetToken t set t.used = true where t.user = :user and t.used = false")
    int invalidateAllForUser(User user);
}
