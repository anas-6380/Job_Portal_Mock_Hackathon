using System.ComponentModel.DataAnnotations;

namespace JobPortal.API.DTOs;

// ─── Auth DTOs ───
public class RegisterDto
{
    [Required] public string FirstName { get; set; } = string.Empty;
    [Required] public string LastName { get; set; } = string.Empty;
    [Required][EmailAddress] public string Email { get; set; } = string.Empty;
    [Required][MinLength(6)] public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    [Required] public string Role { get; set; } = "Candidate"; // "Employer" or "Candidate"
    // Employer fields
    public string? CompanyName { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? CompanyLocation { get; set; }
    // Candidate fields
    public string? Headline { get; set; }
    public string? Skills { get; set; }
}

public class LoginDto
{
    [Required][EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int UserId { get; set; }
}

// ─── Job DTOs ───
public class CreateJobDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? JobType { get; set; }
    public int? ExperienceRequired { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UpdateJobDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? JobType { get; set; }
    public int? ExperienceRequired { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class JobResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? JobType { get; set; }
    public int? ExperienceRequired { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLocation { get; set; }
    public string? CompanyWebsite { get; set; }
    public int EmployerId { get; set; }
    public int ApplicationCount { get; set; }
}

// ─── Candidate DTOs ───
public class UpdateCandidateProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Headline { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Skills { get; set; }
}

public class CandidateProfileDto
{
    public int UserId { get; set; }
    public int CandidateId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Headline { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Skills { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApplyJobDto
{
    [Required] public int JobId { get; set; }
    public int? ResumeId { get; set; }
    public string? CoverLetter { get; set; }
}

public class ApplicationResponseDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
    public string? CoverLetter { get; set; }
    public int? ResumeId { get; set; }
    public string? ResumeFileName { get; set; }
    // Candidate info (for employer view)
    public string? CandidateName { get; set; }
    public string? CandidateEmail { get; set; }
    public string? CandidateHeadline { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Skills { get; set; }
}

// ─── Employer DTOs ───
public class UpdateEmployerProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyDescription { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? CompanyLocation { get; set; }
}

public class EmployerProfileDto
{
    public int UserId { get; set; }
    public int EmployerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyDescription { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? CompanyLocation { get; set; }
}

// ─── Admin DTOs ───
public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalEmployers { get; set; }
    public int TotalCandidates { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int TotalApplications { get; set; }
    public int PendingApplications { get; set; }
}

public class UserListDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateApplicationStatusDto
{
    [Required] public string Status { get; set; } = string.Empty;
}

// ─── Resume DTO ───
public class ResumeDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}

// ─── Common DTOs ───
public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
