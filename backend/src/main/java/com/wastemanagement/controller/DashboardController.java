package com.wastemanagement.controller;

import com.wastemanagement.dto.DashboardStatsDto;
import com.wastemanagement.entity.UserRole;
import com.wastemanagement.security.UserPrincipal;
import com.wastemanagement.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {
    
    @Autowired
    private ComplaintService complaintService;
    
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        
        // Get user role from authorities
        String role = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        UserRole userRole = UserRole.valueOf(role);
        
        DashboardStatsDto stats = complaintService.getDashboardStats(userId, userRole);
        return ResponseEntity.ok(stats);
    }
}