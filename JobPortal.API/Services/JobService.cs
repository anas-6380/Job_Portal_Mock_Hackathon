using Microsoft.EntityFrameworkCore;
using JobPortal.API.Models;
using JobPortal.API.DTOs;

namespace JobPortal.API.Services;

public class JobService
{
    private readonly JobPortalContext _db;

    public JobService(JobPortalContext db) => _db = db;

    public async Task<PagedResultDto<JobResponseDto>> GetJobsAsync(
        int page = 1, int pageSize = 12, string? search = null,
        string? location = null, string? jobType = null, int? minExp = null)
    {
        var query = _db.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .Where(j => j.IsActive && (j.ExpiresAt == null || j.ExpiresAt > DateTime.UtcNow));

        if (!string.IsNullOrEmpty(search))
            query = query.Where(j => j.Title!.Contains(search) || j.Description!.Contains(search));
        if (!string.IsNullOrEmpty(location))
            query = query.Where(j => j.Location!.Contains(location));
        if (!string.IsNullOrEmpty(jobType))
            query = query.Where(j => j.JobType == jobType);
        if (minExp.HasValue)
            query = query.Where(j => j.ExperienceRequired <= minExp.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => MapToDto(j))
            .ToListAsync();

        return new PagedResultDto<JobResponseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<JobResponseDto> GetJobByIdAsync(int id)
    {
        var job = await _db.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == id)
            ?? throw new KeyNotFoundException("Job not found");

        return MapToDto(job);
    }

    public async Task<JobResponseDto> CreateJobAsync(int userId, CreateJobDto dto)
    {
        var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new KeyNotFoundException("Employer profile not found");

        var job = new Job
        {
            EmployerId = employer.Id,
            Title = dto.Title,
            Description = dto.Description,
            Location = dto.Location,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            JobType = dto.JobType,
            ExperienceRequired = dto.ExperienceRequired,
            ExpiresAt = dto.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        };

        _db.Jobs.Add(job);
        await _db.SaveChangesAsync();

        job.Employer = employer;
        return MapToDto(job);
    }

    public async Task<JobResponseDto> UpdateJobAsync(int userId, int jobId, UpdateJobDto dto)
    {
        var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new KeyNotFoundException("Employer profile not found");

        var job = await _db.Jobs.Include(j => j.Employer)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.EmployerId == employer.Id)
            ?? throw new KeyNotFoundException("Job not found or unauthorized");

        if (dto.Title != null) job.Title = dto.Title;
        if (dto.Description != null) job.Description = dto.Description;
        if (dto.Location != null) job.Location = dto.Location;
        if (dto.SalaryMin.HasValue) job.SalaryMin = dto.SalaryMin;
        if (dto.SalaryMax.HasValue) job.SalaryMax = dto.SalaryMax;
        if (dto.JobType != null) job.JobType = dto.JobType;
        if (dto.ExperienceRequired.HasValue) job.ExperienceRequired = dto.ExperienceRequired;
        if (dto.ExpiresAt.HasValue) job.ExpiresAt = dto.ExpiresAt;

        await _db.SaveChangesAsync();
        return MapToDto(job);
    }

    public async Task SoftDeleteJobAsync(int userId, int jobId)
    {
        var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new KeyNotFoundException("Employer profile not found");

        var job = await _db.Jobs
            .FirstOrDefaultAsync(j => j.Id == jobId && j.EmployerId == employer.Id)
            ?? throw new KeyNotFoundException("Job not found or unauthorized");

        job.IsActive = false;
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResultDto<JobResponseDto>> GetEmployerJobsAsync(int userId, int page = 1, int pageSize = 10)
    {
        var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId)
            ?? throw new KeyNotFoundException("Employer profile not found");

        var query = _db.Jobs
            .AsNoTracking()
            .Include(j => j.Employer)
            .Include(j => j.Applications)
            .Where(j => j.EmployerId == employer.Id);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => MapToDto(j))
            .ToListAsync();

        return new PagedResultDto<JobResponseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    private static JobResponseDto MapToDto(Job j) => new()
    {
        Id = j.Id,
        Title = j.Title ?? "",
        Description = j.Description ?? "",
        Location = j.Location,
        SalaryMin = j.SalaryMin,
        SalaryMax = j.SalaryMax,
        JobType = j.JobType,
        ExperienceRequired = j.ExperienceRequired,
        IsActive = j.IsActive,
        CreatedAt = j.CreatedAt,
        ExpiresAt = j.ExpiresAt,
        CompanyName = j.Employer?.CompanyName ?? "",
        CompanyLocation = j.Employer?.CompanyLocation,
        CompanyWebsite = j.Employer?.CompanyWebsite,
        EmployerId = j.EmployerId ?? 0,
        ApplicationCount = j.Applications?.Count ?? 0
    };
}
