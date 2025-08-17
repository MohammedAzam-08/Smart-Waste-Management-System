package com.wastemanagement.service;

import com.wastemanagement.entity.ActivityLog;
import com.wastemanagement.entity.Complaint;
import com.wastemanagement.entity.User;
import com.wastemanagement.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ActivityLogService {
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    public ActivityLog logActivity(String action, String details, Complaint complaint, User user) {
        ActivityLog log = new ActivityLog(action, details, complaint, user);
        return activityLogRepository.save(log);
    }
    
    public List<ActivityLog> getActivityLogsByComplaint(Complaint complaint) {
        return activityLogRepository.findByComplaintOrderByCreatedAtDesc(complaint);
    }
    
    public List<ActivityLog> getActivityLogsByUser(User user) {
        return activityLogRepository.findByUser(user);
    }
    
    public List<ActivityLog> getAllActivityLogs() {
        return activityLogRepository.findAll();
    }
}