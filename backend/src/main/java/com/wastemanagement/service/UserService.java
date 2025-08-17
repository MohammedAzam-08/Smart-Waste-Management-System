package com.wastemanagement.service;

import com.wastemanagement.dto.UserRegistrationDto;
import com.wastemanagement.entity.User;
import com.wastemanagement.entity.UserRole;
import com.wastemanagement.exception.ResourceNotFoundException;
import com.wastemanagement.exception.UserAlreadyExistsException;
import com.wastemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + registrationDto.getEmail() + " already exists");
        }
        
        User user = new User();
        user.setName(registrationDto.getName());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setPhone(registrationDto.getPhone());
        user.setRole(registrationDto.getRole());
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> findUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public List<User> findActiveUsersByRole(UserRole role) {
        return userRepository.findActiveUsersByRole(role);
    }
    
    public User updateUser(String id, User userDetails) {
        User user = findById(id);
        
        user.setName(userDetails.getName());
        user.setPhone(userDetails.getPhone());
        
        return userRepository.save(user);
    }
    
    public void deactivateUser(String id) {
        User user = findById(id);
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    public void activateUser(String id) {
        User user = findById(id);
        user.setIsActive(true);
        userRepository.save(user);
    }
    
    public long countUsersByRole(UserRole role) {
        return userRepository.countByRole(role);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}