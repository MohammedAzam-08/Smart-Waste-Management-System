package com.wastemanagement.service;

import com.wastemanagement.dto.ComplaintDto;
import com.wastemanagement.dto.DashboardStatsDto;
import com.wastemanagement.entity.*;
import com.wastemanagement.exception.ResourceNotFoundException;
import com.wastemanagement.exception.UnauthorizedException;
import com.wastemanagement.repository.ComplaintRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintService {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ActivityLogService activityLogService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private ModelMapper modelMapper;
    
    public ComplaintDto createComplaint(ComplaintDto complaintDto, String citizenId, MultipartFile image) {
        User citizen = userService.findById(citizenId);
        
        Complaint complaint = new Complaint();
        complaint.setTitle(complaintDto.getTitle());
        complaint.setDescription(complaintDto.getDescription());
        complaint.setAddress(complaintDto.getAddress());
        complaint.setLocationLat(complaintDto.getLocationLat());
        complaint.setLocationLng(complaintDto.getLocationLng());
        complaint.setPriority(complaintDto.getPriority() != null ? complaintDto.getPriority() : Priority.MEDIUM);
        complaint.setCitizen(citizen);
        
        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.storeFile(image);
            complaint.setImagePath(imagePath);
        }
        
        complaint = complaintRepository.save(complaint);
        
        // Log activity
        activityLogService.logActivity("CREATED", "Complaint submitted by citizen", complaint, citizen);
        
        return convertToDto(complaint);
    }
    
    public List<ComplaintDto> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ComplaintDto> getComplaintsByCitizen(String citizenId) {
        User citizen = userService.findById(citizenId);
        return complaintRepository.findByCitizen(citizen).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ComplaintDto> getComplaintsByWorker(String workerId) {
        User worker = userService.findById(workerId);
        return complaintRepository.findByAssignedWorker(worker).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public ComplaintDto getComplaintById(String id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return convertToDto(complaint);
    }
    
    public ComplaintDto assignWorker(String complaintId, String workerId, String agentId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        
        User worker = userService.findById(workerId);
        User agent = userService.findById(agentId);
        
        if (worker.getRole() != UserRole.WORKER) {
            throw new IllegalArgumentException("Assigned user must be a worker");
        }
        
        complaint.setAssignedWorker(worker);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setAssignedAt(LocalDateTime.now());
        
        complaint = complaintRepository.save(complaint);
        
        // Log activity
        activityLogService.logActivity("ASSIGNED", 
                "Complaint assigned to worker: " + worker.getName(), complaint, agent);
        
        return convertToDto(complaint);
    }
    
    public ComplaintDto startWork(String complaintId, String workerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        
        User worker = userService.findById(workerId);
        
        if (!complaint.getAssignedWorker().getId().equals(workerId)) {
            throw new UnauthorizedException("Worker is not assigned to this complaint");
        }
        
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint = complaintRepository.save(complaint);
        
        // Log activity
        activityLogService.logActivity("STARTED", "Work started on complaint", complaint, worker);
        
        return convertToDto(complaint);
    }
    
    public ComplaintDto completeWork(String complaintId, String workerId, 
                                   MultipartFile beforeImage, MultipartFile afterImage) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        
        User worker = userService.findById(workerId);
        
        if (!complaint.getAssignedWorker().getId().equals(workerId)) {
            throw new UnauthorizedException("Worker is not assigned to this complaint");
        }
        
        if (beforeImage != null && !beforeImage.isEmpty()) {
            String beforeImagePath = fileStorageService.storeFile(beforeImage);
            complaint.setBeforeImagePath(beforeImagePath);
        }
        
        if (afterImage != null && !afterImage.isEmpty()) {
            String afterImagePath = fileStorageService.storeFile(afterImage);
            complaint.setAfterImagePath(afterImagePath);
        }
        
        complaint.setStatus(ComplaintStatus.COMPLETED);
        complaint.setCompletedAt(LocalDateTime.now());
        complaint = complaintRepository.save(complaint);
        
        // Log activity
        activityLogService.logActivity("COMPLETED", 
                "Work completed with before/after photos", complaint, worker);
        
        return convertToDto(complaint);
    }
    
    public ComplaintDto verifyCompletion(String complaintId, String agentId, boolean approved, String feedback) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        
        User agent = userService.findById(agentId);
        
        if (approved) {
            complaint.setStatus(ComplaintStatus.VERIFIED);
            complaint.setVerifiedAt(LocalDateTime.now());
        } else {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
        }
        
        complaint = complaintRepository.save(complaint);
        
        // Log activity
        String action = approved ? "VERIFIED" : "REJECTED";
        String details = feedback != null ? feedback : "Complaint " + action.toLowerCase() + " by agent";
        activityLogService.logActivity(action, details, complaint, agent);
        
        return convertToDto(complaint);
    }
    
    public ComplaintDto submitFeedback(String complaintId, String citizenId, String feedback, Integer rating) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        
        User citizen = userService.findById(citizenId);
        
        if (!complaint.getCitizen().getId().equals(citizenId)) {
            throw new UnauthorizedException("Citizen can only provide feedback for their own complaints");
        }
        
        complaint.setFeedback(feedback);
        complaint.setRating(rating);
        complaint = complaintRepository.save(complaint);
        
        // Log activity
        activityLogService.logActivity("FEEDBACK", 
                "Citizen provided feedback and rating: " + rating + "/5", complaint, citizen);
        
        return convertToDto(complaint);
    }
    
    public DashboardStatsDto getDashboardStats(String userId, UserRole userRole) {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        switch (userRole) {
            case AGENT:
                stats.setTotalComplaints(complaintRepository.count());
                stats.setPendingComplaints(complaintRepository.countByStatus(ComplaintStatus.PENDING));
                stats.setAssignedComplaints(complaintRepository.countByStatus(ComplaintStatus.ASSIGNED));
                stats.setInProgressComplaints(complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS));
                stats.setCompletedComplaints(complaintRepository.countByStatus(ComplaintStatus.COMPLETED));
                stats.setVerifiedComplaints(complaintRepository.countByStatus(ComplaintStatus.VERIFIED));
                
                // Status breakdown
                Map<String, Long> statusBreakdown = new HashMap<>();
                List<Object[]> statusStats = complaintRepository.getStatusStatistics();
                for (Object[] stat : statusStats) {
                    statusBreakdown.put(stat[0].toString(), (Long) stat[1]);
                }
                stats.setStatusBreakdown(statusBreakdown);
                
                // Priority breakdown
                Map<String, Long> priorityBreakdown = new HashMap<>();
                List<Object[]> priorityStats = complaintRepository.getPriorityStatistics();
                for (Object[] stat : priorityStats) {
                    priorityBreakdown.put(stat[0].toString(), (Long) stat[1]);
                }
                stats.setPriorityBreakdown(priorityBreakdown);
                break;
                
            case WORKER:
                User worker = userService.findById(userId);
                stats.setAssignedTasks(complaintRepository.countByAssignedWorker(worker));
                stats.setCompletedTasks(complaintRepository.countByAssignedWorkerAndStatus(worker, ComplaintStatus.COMPLETED) +
                                      complaintRepository.countByAssignedWorkerAndStatus(worker, ComplaintStatus.VERIFIED));
                stats.setPendingTasks(complaintRepository.countByAssignedWorkerAndStatus(worker, ComplaintStatus.ASSIGNED) +
                                    complaintRepository.countByAssignedWorkerAndStatus(worker, ComplaintStatus.IN_PROGRESS));
                break;
                
            case CITIZEN:
                User citizen = userService.findById(userId);
                stats.setMyComplaints(complaintRepository.countByCitizen(citizen));
                stats.setResolvedComplaints(complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.VERIFIED));
                stats.setPendingComplaints(complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.PENDING) +
                                         complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.ASSIGNED) +
                                         complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.IN_PROGRESS));
                break;
        }
        
        return stats;
    }
    
    public Page<ComplaintDto> getComplaintsWithPagination(Pageable pageable) {
        return complaintRepository.findAll(pageable).map(this::convertToDto);
    }
    
    public List<ComplaintDto> getComplaintsByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private ComplaintDto convertToDto(Complaint complaint) {
        ComplaintDto dto = modelMapper.map(complaint, ComplaintDto.class);
        
        // Set citizen information
        if (complaint.getCitizen() != null) {
            dto.setCitizenId(complaint.getCitizen().getId());
            dto.setCitizenName(complaint.getCitizen().getName());
            dto.setCitizenEmail(complaint.getCitizen().getEmail());
        }
        
        // Set assigned worker information
        if (complaint.getAssignedWorker() != null) {
            dto.setAssignedWorkerId(complaint.getAssignedWorker().getId());
            dto.setAssignedWorkerName(complaint.getAssignedWorker().getName());
        }
        
        return dto;
    }
}