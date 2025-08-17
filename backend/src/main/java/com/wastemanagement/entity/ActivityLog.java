package com.wastemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@EntityListeners(AuditingEntityListener.class)
public class ActivityLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @NotBlank(message = "Action is required")
    @Column(nullable = false)
    private String action;
    
    @Column(length = 500)
    private String details;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Constructors
    public ActivityLog() {}
    
    public ActivityLog(String action, String details, Complaint complaint, User user) {
        this.action = action;
        this.details = details;
        this.complaint = complaint;
        this.user = user;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}