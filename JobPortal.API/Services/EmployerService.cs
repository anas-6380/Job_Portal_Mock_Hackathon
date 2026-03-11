using Microsoft.EntityFrameworkCore;
using JobPortal.API.Models;
using JobPortal.API.DTOs;

namespace JobPortal.API.Services;

public class EmployerService
{
    private readonly JobPortalContext _db;

    public EmployerService(JobPortalContext db) => _db = db;

    public async Task<EmployerProfileDto> GetProfileAsync(int userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.Employer)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        var employer = user.Employer
            ?? throw new KeyNotFoundException("Employer profile not found");

        return new EmployerProfileDto
        {
            UserId = user.Id,
            EmployerId = employer.Id,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            Email = user.Email ?? "",
            Phone = user.Phone,
            CompanyName = employer.CompanyName,
            CompanyDescription = employer.CompanyDescription,
            CompanyWebsite = employer.CompanyWebsite,
            CompanyLocation = employer.CompanyLocation
        };
    }

    public async Task<EmployerProfileDto> UpdateProfileAsync(int userId, UpdateEmployerProfileDto dto)
    {
        var user = await _db.Users
            .Include(u => u.Employer)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        var employer = user.Employer
            ?? throw new KeyNotFoundException("Employer profile not found");

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.CompanyName != null) employer.CompanyName = dto.CompanyName;
        if (dto.CompanyDescription != null) employer.CompanyDescription = dto.CompanyDescription;
        if (dto.CompanyWebsite != null) employer.CompanyWebsite = dto.CompanyWebsite;
        if (dto.CompanyLocation != null) employer.CompanyLocation = dto.CompanyLocation;

        await _db.SaveChangesAsync();
        return await GetProfileAsync(userId);
    }

    public async Task<PagedResultDto<ApplicationResponseDto>> GetApplicantsAsync(int userId, int jobId, int page = 1, int pageSize = 10)
    {
        var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new KeyNotFoundException("Employer profile not found");

        var jobOwned = await _db.Jobs.AnyAsync(j => j.Id == jobId && j.EmployerId == employer.Id);
        if (!jobOwned) throw new InvalidOperationException("Job not found or unauthorized");

        var query = _db.JobApplications
            .AsNoTracking()
            .Include(a => a.Candidate).ThenInclude(c => c!.User)
            .Include(a => a.Resume)
            .Include(a => a.Job)
            .Where(a => a.JobId == jobId);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.AppliedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ApplicationResponseDto
            {
                Id = a.Id,
                JobId = a.JobId ?? 0,
                JobTitle = a.Job!.Title ?? "",
                CompanyName = employer.CompanyName ?? "",
                Status = a.Status,
                AppliedAt = a.AppliedAt,
                CoverLetter = a.CoverLetter,
                ResumeId = a.ResumeId,
                ResumeFileName = a.Resume != null ? a.Resume.FileName : null,
                CandidateName = (a.Candidate!.User!.FirstName ?? "") + " " + (a.Candidate.User.LastName ?? ""),
                CandidateEmail = a.Candidate.User.Email,
                CandidateHeadline = a.Candidate.Headline,
                ExperienceYears = a.Candidate.ExperienceYears,
                Skills = a.Candidate.Skills
            })
            .ToListAsync();

        return new PagedResultDto<ApplicationResponseDto>
        {
            Items = items, TotalCount = totalCount, Page = page, PageSize = pageSize
        };
    }

    public async Task<ApplicationResponseDto> UpdateApplicationStatusAsync(int userId, int applicationId, string status)
    {
        var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new KeyNotFoundException("Employer profile not found");

        var application = await _db.JobApplications
            .Include(a => a.Job)
            .Include(a => a.Candidate).ThenInclude(c => c!.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.Job!.EmployerId == employer.Id)
            ?? throw new KeyNotFoundException("Application not found or unauthorized");

        application.Status = status;
        await _db.SaveChangesAsync();

        return new ApplicationResponseDto
        {
            Id = application.Id,
            JobId = application.JobId ?? 0,
            JobTitle = application.Job?.Title ?? "",
            CompanyName = employer.CompanyName ?? "",
            Status = application.Status,
            AppliedAt = application.AppliedAt,
            CandidateName = (application.Candidate?.User?.FirstName ?? "") + " " + (application.Candidate?.User?.LastName ?? ""),
            CandidateEmail = application.Candidate?.User?.Email
        };
    }

    public async Task<(byte[] data, string fileName, string contentType)> DownloadApplicantResumeAsync(int userId, int applicationId)
    {
        var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new KeyNotFoundException("Employer profile not found");

        var application = await _db.JobApplications
            .AsNoTracking()
            .Include(a => a.Job)
            .Include(a => a.Resume)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.Job!.EmployerId == employer.Id)
            ?? throw new KeyNotFoundException("Application not found or unauthorized");

        var resume = application.Resume
            ?? throw new KeyNotFoundException("No resume attached to this application");

        if (!File.Exists(resume.FilePath))
            throw new KeyNotFoundException("Resume file not found on server");

        var data = await File.ReadAllBytesAsync(resume.FilePath!);
        var ext = Path.GetExtension(resume.FileName ?? "").ToLower();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };

        return (data, resume.FileName ?? "resume", contentType);
    }
}
