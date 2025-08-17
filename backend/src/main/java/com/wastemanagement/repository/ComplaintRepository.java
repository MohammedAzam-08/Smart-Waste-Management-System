package com.wastemanagement.repository;

import com.wastemanagement.entity.Complaint;
import com.wastemanagement.entity.ComplaintStatus;
import com.wastemanagement.entity.Priority;
import com.wastemanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    
    List<Complaint> findByCitizen(User citizen);
    
    List<Complaint> findByAssignedWorker(User worker);
    
    List<Complaint> findByStatus(ComplaintStatus status);
    
    List<Complaint> findByPriority(Priority priority);
    
    Page<Complaint> findByCitizen(User citizen, Pageable pageable);
    
    Page<Complaint> findByAssignedWorker(User worker, Pageable pageable);
    
    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);
    
    @Query("SELECT c FROM Complaint c WHERE c.status = :status AND c.priority = :priority")
    List<Complaint> findByStatusAndPriority(@Param("status") ComplaintStatus status, 
                                          @Param("priority") Priority priority);
    
    @Query("SELECT c FROM Complaint c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    List<Complaint> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
    long countByStatus(@Param("status") ComplaintStatus status);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.citizen = :citizen")
    long countByCitizen(@Param("citizen") User citizen);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedWorker = :worker")
    long countByAssignedWorker(@Param("worker") User worker);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.citizen = :citizen AND c.status = :status")
    long countByCitizenAndStatus(@Param("citizen") User citizen, @Param("status") ComplaintStatus status);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedWorker = :worker AND c.status = :status")
    long countByAssignedWorkerAndStatus(@Param("worker") User worker, @Param("status") ComplaintStatus status);
    
    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> getStatusStatistics();
    
    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> getPriorityStatistics();
}