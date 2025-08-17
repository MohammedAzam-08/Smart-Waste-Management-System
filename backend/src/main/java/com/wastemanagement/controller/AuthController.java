package com.wastemanagement.controller;

import com.wastemanagement.dto.JwtResponse;
import com.wastemanagement.dto.UserLoginDto;
import com.wastemanagement.dto.UserRegistrationDto;
import com.wastemanagement.entity.User;
import com.wastemanagement.security.JwtUtils;
import com.wastemanagement.security.UserPrincipal;
import com.wastemanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody UserLoginDto loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        return ResponseEntity.ok(new JwtResponse(jwt,
                userPrincipal.getId(),
                userPrincipal.getName(),
                userPrincipal.getUsername(),
                userService.findById(userPrincipal.getId()).getRole()));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto signUpRequest) {
        if (userService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Error: Email is already in use!");
        }
        
        User user = userService.registerUser(signUpRequest);
        
        // Automatically login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signUpRequest.getEmail(), signUpRequest.getPassword()));
        
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        return ResponseEntity.ok(new JwtResponse(jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()));
    }
}