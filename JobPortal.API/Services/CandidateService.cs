using Microsoft.EntityFrameworkCore;
using JobPortal.API.Models;
using JobPortal.API.DTOs;

namespace JobPortal.API.Services;

public class CandidateService
{
    private readonly JobPortalContext _db;

    public CandidateService(JobPortalContext db) => _db = db;

    public async Task<CandidateProfileDto> GetProfileAsync(int userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.Candidate)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        var candidate = user.Candidate
            ?? throw new KeyNotFoundException("Candidate profile not found");

        return new CandidateProfileDto
        {
            UserId = user.Id,
            CandidateId = candidate.Id,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            Email = user.Email ?? "",
            Phone = user.Phone,
            Headline = candidate.Headline,
            ExperienceYears = candidate.ExperienceYears,
            Skills = candidate.Skills,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<CandidateProfileDto> UpdateProfileAsync(int userId, UpdateCandidateProfileDto dto)
    {
        var user = await _db.Users
            .Include(u => u.Candidate)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        var candidate = user.Candidate
            ?? throw new KeyNotFoundException("Candidate profile not found");

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.Headline != null) candidate.Headline = dto.Headline;
        if (dto.ExperienceYears.HasValue) candidate.ExperienceYears = dto.ExperienceYears;
        if (dto.Skills != null) candidate.Skills = dto.Skills;

        await _db.SaveChangesAsync();
        return await GetProfileAsync(userId);
    }

    public async Task<ApplicationResponseDto> ApplyForJobAsync(int userId, ApplyJobDto dto)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException("Candidate profile not found");

        var job = await _db.Jobs.Include(j => j.Employer)
            .FirstOrDefaultAsync(j => j.Id == dto.JobId && j.IsActive)
            ?? throw new KeyNotFoundException("Job not found or inactive");

        if (job.ExpiresAt.HasValue && job.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("This job posting has expired");

        var alreadyApplied = await _db.JobApplications
            .AnyAsync(a => a.JobId == dto.JobId && a.CandidateId == candidate.Id);

        if (alreadyApplied)
            throw new InvalidOperationException("You have already applied for this job");

        if (dto.ResumeId.HasValue)
        {
            var resumeOwned = await _db.Resumes
                .AnyAsync(r => r.Id == dto.ResumeId && r.CandidateId == candidate.Id);
            if (!resumeOwned)
                throw new InvalidOperationException("Resume does not belong to you");
        }

        var application = new JobApplication
        {
            JobId = dto.JobId,
            CandidateId = candidate.Id,
            ResumeId = dto.ResumeId,
            CoverLetter = dto.CoverLetter,
            Status = "Applied",
            AppliedAt = DateTime.UtcNow
        };

        _db.JobApplications.Add(application);
        await _db.SaveChangesAsync();

        return new ApplicationResponseDto
        {
            Id = application.Id,
            JobId = job.Id,
            JobTitle = job.Title ?? "",
            CompanyName = job.Employer?.CompanyName ?? "",
            Location = job.Location,
            Status = application.Status,
            AppliedAt = application.AppliedAt,
            CoverLetter = application.CoverLetter
        };
    }

    public async Task<PagedResultDto<ApplicationResponseDto>> GetApplicationsAsync(int userId, int page = 1, int pageSize = 10)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException("Candidate profile not found");

        var query = _db.JobApplications
            .AsNoTracking()
            .Include(a => a.Job).ThenInclude(j => j!.Employer)
            .Include(a => a.Resume)
            .Where(a => a.CandidateId == candidate.Id);

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
                CompanyName = a.Job.Employer!.CompanyName ?? "",
                Location = a.Job.Location,
                Status = a.Status,
                AppliedAt = a.AppliedAt,
                CoverLetter = a.CoverLetter,
                ResumeFileName = a.Resume != null ? a.Resume.FileName : null
            })
            .ToListAsync();

        return new PagedResultDto<ApplicationResponseDto>
        {
            Items = items, TotalCount = totalCount, Page = page, PageSize = pageSize
        };
    }
}
