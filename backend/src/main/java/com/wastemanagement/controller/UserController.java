package com.wastemanagement.controller;

import com.wastemanagement.entity.User;
import com.wastemanagement.entity.UserRole;
import com.wastemanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/workers")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<User>> getWorkers() {
        List<User> workers = userService.findActiveUsersByRole(UserRole.WORKER);
        return ResponseEntity.ok(workers);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> deactivateUser(@PathVariable String id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> activateUser(@PathVariable String id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }
}