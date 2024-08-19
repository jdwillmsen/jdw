package com.jdw.usersrole.services;

import com.jdw.usersrole.dtos.UserRequestDTO;
import com.jdw.usersrole.exceptions.ResourceExistsException;
import com.jdw.usersrole.exceptions.ResourceNotFoundException;
import com.jdw.usersrole.models.Status;
import com.jdw.usersrole.models.User;
import com.jdw.usersrole.repositories.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        log.info("Getting all users");
        return userRepository.findAll();
    }

    public User getUserById(@NotNull Long id) {
        log.info("Getting user with id: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    public User getUserByEmailAddress(@NotNull String emailAddress) {
        log.info("Getting user with email address: {}", emailAddress);
        return userRepository.findByEmailAddress(emailAddress)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email address " + emailAddress));
    }

    public User createUser(@NotNull @Valid UserRequestDTO userDTO) {
        log.info("Creating user: {}", userDTO);
        return createUser(userDTO, 1L);
    }

    public User createUser(@NotNull @Valid UserRequestDTO userDTO, @NotNull String emailAddress) {
        log.info("Creating user: user={}, requester={}", userDTO, emailAddress);
        Long userId = getUserIdByEmailAddress(emailAddress);
        return createUser(userDTO, userId);
    }

    public User createUser(@NotNull @Valid UserRequestDTO userDTO, @NotNull Long userId) {
        log.info("Creating user: user={}, requesterId={}", userDTO, userId);
        userRepository.findByEmailAddress(userDTO.emailAddress())
                .ifPresent(user -> {
                    throw new ResourceExistsException("User already exists with email address " + userDTO.emailAddress());
                });
        Timestamp currentTime = Timestamp.from(Instant.now());
        User newUser = User.builder()
                .emailAddress(userDTO.emailAddress())
                .password(passwordEncoder.encode(userDTO.password()))
                .status(Status.ACTIVE.name())
                .roles(null)
                .createdByUserId(userId)
                .createdTime(currentTime)
                .modifiedByUserId(userId)
                .modifiedTime(currentTime)
                .build();
        return userRepository.save(newUser);
    }

    public User updateUser(@NotNull Long id, @Valid UserRequestDTO userDTO, @NotNull String emailAddress) {
        log.info("Updating user: user={}, requester={}", userDTO, emailAddress);
        User currentUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        Long userId = getUserIdByEmailAddress(emailAddress);
        Timestamp currentTime = Timestamp.from(Instant.now());
        User updatedUser = User.builder()
                .id(id)
                .emailAddress(userDTO.emailAddress())
                .password(passwordEncoder.encode(userDTO.password()))
                .status(currentUser.status())
                .roles(currentUser.roles())
                .profile(currentUser.profile())
                .createdByUserId(currentUser.createdByUserId())
                .createdTime(currentUser.createdTime())
                .modifiedByUserId(userId)
                .modifiedTime(currentTime)
                .build();
        return userRepository.save(updatedUser);
    }

    public void deleteUser(@NotNull Long id, @NotNull String emailAddress) {
        log.info("Deleting user: id={}, requester={}", id, emailAddress);
        userRepository.deleteById(id);
    }

    public Long getUserIdByEmailAddress(@NotNull String emailAddress) {
        log.info("Getting user id with email address: {}", emailAddress);
        return getUserByEmailAddress(emailAddress).id();
    }
}
