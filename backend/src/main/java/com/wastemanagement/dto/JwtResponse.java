package com.wastemanagement.dto;

import com.wastemanagement.entity.UserRole;

public class JwtResponse {
    
    private String token;
    private String type = "Bearer";
    private String id;
    private String name;
    private String email;
    private UserRole role;
    
    public JwtResponse(String accessToken, String id, String name, String email, UserRole role) {
        this.token = accessToken;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
}