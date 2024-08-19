package com.jdw.usersrole.controllers;

import com.jdw.usersrole.dtos.UserRequestDTO;
import com.jdw.usersrole.models.User;
import com.jdw.usersrole.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j
public class UsersController {
    private final UserService userService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        log.trace("Getting all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasAuthority('ADMIN') or #userId == authentication.principal.getUserId()")
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        log.trace("Getting user with id {}", userId);
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasAuthority('ADMIN') or #emailAddress == authentication.principal.getUsername()")
    @GetMapping("/email/{emailAddress}")
    public ResponseEntity<User> getUserByEmailAddress(@PathVariable String emailAddress) {
        log.trace("Getting user with email address {}", emailAddress);
        User user = userService.getUserByEmailAddress(emailAddress);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody UserRequestDTO user) {
        log.trace("Creating user {}", user);
        User userCreated = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userCreated);
    }

    @PreAuthorize("hasAuthority('ADMIN') or #userId == authentication.principal.getUserId()")
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @Valid @RequestBody UserRequestDTO user) {
        log.trace("Updating user with id {}", userId);
        User userUpdated = userService.updateUser(userId, user);
        return ResponseEntity.ok(userUpdated);
    }

    @PreAuthorize("hasAuthority('ADMIN') or #userId == authentication.principal.getUserId()")
    @DeleteMapping("/{userId}")
    public ResponseEntity<User> deleteUser(@PathVariable Long userId) {
        log.trace("Deleting user with id {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
