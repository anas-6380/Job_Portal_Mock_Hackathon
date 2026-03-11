using Microsoft.EntityFrameworkCore;
using JobPortal.API.Models;
using JobPortal.API.DTOs;

namespace JobPortal.API.Services;

public class AdminService
{
    private readonly JobPortalContext _db;

    public AdminService(JobPortalContext db) => _db = db;

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        return new DashboardStatsDto
        {
            TotalUsers = await _db.Users.CountAsync(),
            TotalEmployers = await _db.Employers.CountAsync(),
            TotalCandidates = await _db.Candidates.CountAsync(),
            TotalJobs = await _db.Jobs.CountAsync(),
            ActiveJobs = await _db.Jobs.CountAsync(j => j.IsActive),
            TotalApplications = await _db.JobApplications.CountAsync(),
            PendingApplications = await _db.JobApplications.CountAsync(a => a.Status == "Applied")
        };
    }

    public async Task<PagedResultDto<UserListDto>> GetAllUsersAsync(int page = 1, int pageSize = 20)
    {
        var query = _db.Users.AsNoTracking().Include(u => u.Role);
        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                FirstName = u.FirstName ?? "",
                LastName = u.LastName ?? "",
                Email = u.Email ?? "",
                Phone = u.Phone,
                Role = u.Role!.Name,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new PagedResultDto<UserListDto>
        {
            Items = items, TotalCount = totalCount, Page = page, PageSize = pageSize
        };
    }

    public async Task<UserListDto> ToggleUserStatusAsync(int userId)
    {
        var user = await _db.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();

        return new UserListDto
        {
            Id = user.Id,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            Email = user.Email ?? "",
            Phone = user.Phone,
            Role = user.Role?.Name ?? "",
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<PagedResultDto<JobResponseDto>> GetAllJobsAsync(int page = 1, int pageSize = 20)
    {
        var query = _db.Jobs.AsNoTracking()
            .Include(j => j.Employer)
            .Include(j => j.Applications);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JobResponseDto
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
                CompanyName = j.Employer!.CompanyName ?? "",
                CompanyLocation = j.Employer.CompanyLocation,
                EmployerId = j.EmployerId ?? 0,
                ApplicationCount = j.Applications.Count
            })
            .ToListAsync();

        return new PagedResultDto<JobResponseDto>
        {
            Items = items, TotalCount = totalCount, Page = page, PageSize = pageSize
        };
    }

    public async Task ModerateJobAsync(int jobId, bool isActive)
    {
        var job = await _db.Jobs.FindAsync(jobId)
            ?? throw new KeyNotFoundException("Job not found");
        job.IsActive = isActive;
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResultDto<ApplicationResponseDto>> GetAllApplicationsAsync(int page = 1, int pageSize = 20)
    {
        var query = _db.JobApplications
            .AsNoTracking()
            .Include(a => a.Job).ThenInclude(j => j!.Employer)
            .Include(a => a.Candidate).ThenInclude(c => c!.User)
            .Include(a => a.Resume);

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
                ResumeFileName = a.Resume != null ? a.Resume.FileName : null,
                CandidateName = (a.Candidate!.User!.FirstName ?? "") + " " + (a.Candidate.User.LastName ?? ""),
                CandidateEmail = a.Candidate.User.Email,
                CandidateHeadline = a.Candidate.Headline,
                ExperienceYears = a.Candidate.ExperienceYears
            })
            .ToListAsync();

        return new PagedResultDto<ApplicationResponseDto>
        {
            Items = items, TotalCount = totalCount, Page = page, PageSize = pageSize
        };
    }
}
