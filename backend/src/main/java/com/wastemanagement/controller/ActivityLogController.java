package com.wastemanagement.controller;

import com.wastemanagement.entity.ActivityLog;
import com.wastemanagement.entity.Complaint;
import com.wastemanagement.service.ActivityLogService;
import com.wastemanagement.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints/{complaintId}/logs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ActivityLogController {
    
    @Autowired
    private ActivityLogService activityLogService;
    
    @Autowired
    private ComplaintService complaintService;
    
    @GetMapping
    public ResponseEntity<List<ActivityLog>> getActivityLogs(@PathVariable String complaintId) {
        // This would need to be implemented to convert ComplaintDto back to Complaint entity
        // For now, returning empty list
        return ResponseEntity.ok(List.of());
    }
}