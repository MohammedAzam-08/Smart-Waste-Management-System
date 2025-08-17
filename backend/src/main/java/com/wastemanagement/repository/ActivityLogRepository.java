package com.wastemanagement.repository;

import com.wastemanagement.entity.ActivityLog;
import com.wastemanagement.entity.Complaint;
import com.wastemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    
    List<ActivityLog> findByComplaint(Complaint complaint);
    
    List<ActivityLog> findByUser(User user);
    
    List<ActivityLog> findByComplaintOrderByCreatedAtDesc(Complaint complaint);
    
    @Query("SELECT al FROM ActivityLog al WHERE al.createdAt BETWEEN :startDate AND :endDate")
    List<ActivityLog> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT al FROM ActivityLog al WHERE al.complaint = :complaint ORDER BY al.createdAt DESC")
    List<ActivityLog> findByComplaintOrderByCreatedAtDescending(@Param("complaint") Complaint complaint);
}