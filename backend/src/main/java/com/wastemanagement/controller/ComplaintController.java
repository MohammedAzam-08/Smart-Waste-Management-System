package com.wastemanagement.controller;

import com.wastemanagement.dto.ComplaintDto;
import com.wastemanagement.entity.UserRole;
import com.wastemanagement.security.UserPrincipal;
import com.wastemanagement.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ComplaintController {
    
    @Autowired
    private ComplaintService complaintService;
    
    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<?> createComplaint(
            @Valid @ModelAttribute ComplaintDto complaintDto,
            @RequestParam(required = false) MultipartFile image,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        ComplaintDto createdComplaint = complaintService.createComplaint(complaintDto, userPrincipal.getId(), image);
        
        return ResponseEntity.ok(createdComplaint);
    }
    
    @GetMapping
    public ResponseEntity<List<ComplaintDto>> getComplaints(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        
        // Get user role from authorities
        String role = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        UserRole userRole = UserRole.valueOf(role);
        
        List<ComplaintDto> complaints;
        
        switch (userRole) {
            case CITIZEN:
                complaints = complaintService.getComplaintsByCitizen(userId);
                break;
            case WORKER:
                complaints = complaintService.getComplaintsByWorker(userId);
                break;
            case AGENT:
                complaints = complaintService.getAllComplaints();
                break;
            default:
                complaints = List.of();
        }
        
        return ResponseEntity.ok(complaints);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDto> getComplaintById(@PathVariable String id) {
        ComplaintDto complaint = complaintService.getComplaintById(id);
        return ResponseEntity.ok(complaint);
    }
    
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> assignWorker(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String workerId = request.get("workerId");
        
        ComplaintDto updatedComplaint = complaintService.assignWorker(id, workerId, userPrincipal.getId());
        return ResponseEntity.ok(updatedComplaint);
    }
    
    @PutMapping("/{id}/start")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> startWork(@PathVariable String id, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        ComplaintDto updatedComplaint = complaintService.startWork(id, userPrincipal.getId());
        return ResponseEntity.ok(updatedComplaint);
    }
    
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> completeWork(
            @PathVariable String id,
            @RequestParam(required = false) MultipartFile beforeImage,
            @RequestParam(required = false) MultipartFile afterImage,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        ComplaintDto updatedComplaint = complaintService.completeWork(id, userPrincipal.getId(), beforeImage, afterImage);
        return ResponseEntity.ok(updatedComplaint);
    }
    
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<?> verifyCompletion(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        boolean approved = (Boolean) request.get("approved");
        String feedback = (String) request.get("feedback");
        
        ComplaintDto updatedComplaint = complaintService.verifyCompletion(id, userPrincipal.getId(), approved, feedback);
        return ResponseEntity.ok(updatedComplaint);
    }
    
    @PutMapping("/{id}/feedback")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<?> submitFeedback(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String feedback = (String) request.get("feedback");
        Integer rating = (Integer) request.get("rating");
        
        ComplaintDto updatedComplaint = complaintService.submitFeedback(id, userPrincipal.getId(), feedback, rating);
        return ResponseEntity.ok(updatedComplaint);
    }
}