package com.wastemanagement.dto;

import java.util.Map;

public class DashboardStatsDto {
    
    private Long totalComplaints;
    private Long pendingComplaints;
    private Long assignedComplaints;
    private Long inProgressComplaints;
    private Long completedComplaints;
    private Long verifiedComplaints;
    private Long myComplaints;
    private Long resolvedComplaints;
    private Long assignedTasks;
    private Long pendingTasks;
    private Long completedTasks;
    private Map<String, Long> statusBreakdown;
    private Map<String, Long> priorityBreakdown;
    
    // Constructors
    public DashboardStatsDto() {}
    
    // Getters and Setters
    public Long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(Long totalComplaints) { this.totalComplaints = totalComplaints; }
    
    public Long getPendingComplaints() { return pendingComplaints; }
    public void setPendingComplaints(Long pendingComplaints) { this.pendingComplaints = pendingComplaints; }
    
    public Long getAssignedComplaints() { return assignedComplaints; }
    public void setAssignedComplaints(Long assignedComplaints) { this.assignedComplaints = assignedComplaints; }
    
    public Long getInProgressComplaints() { return inProgressComplaints; }
    public void setInProgressComplaints(Long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }
    
    public Long getCompletedComplaints() { return completedComplaints; }
    public void setCompletedComplaints(Long completedComplaints) { this.completedComplaints = completedComplaints; }
    
    public Long getVerifiedComplaints() { return verifiedComplaints; }
    public void setVerifiedComplaints(Long verifiedComplaints) { this.verifiedComplaints = verifiedComplaints; }
    
    public Long getMyComplaints() { return myComplaints; }
    public void setMyComplaints(Long myComplaints) { this.myComplaints = myComplaints; }
    
    public Long getResolvedComplaints() { return resolvedComplaints; }
    public void setResolvedComplaints(Long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }
    
    public Long getAssignedTasks() { return assignedTasks; }
    public void setAssignedTasks(Long assignedTasks) { this.assignedTasks = assignedTasks; }
    
    public Long getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(Long pendingTasks) { this.pendingTasks = pendingTasks; }
    
    public Long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Long completedTasks) { this.completedTasks = completedTasks; }
    
    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }
    
    public Map<String, Long> getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }
}