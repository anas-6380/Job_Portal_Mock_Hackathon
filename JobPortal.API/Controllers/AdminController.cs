using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AdminService _adminService;

    public AdminController(AdminService adminService) => _adminService = adminService;

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var result = await _adminService.GetDashboardStatsAsync();
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<ActionResult<PagedResultDto<UserListDto>>> GetAllUsers(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _adminService.GetAllUsersAsync(page, pageSize);
        return Ok(result);
    }

    [HttpPut("users/{userId}/toggle-status")]
    public async Task<ActionResult<UserListDto>> ToggleUserStatus(int userId)
    {
        var result = await _adminService.ToggleUserStatusAsync(userId);
        return Ok(result);
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<PagedResultDto<JobResponseDto>>> GetAllJobs(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _adminService.GetAllJobsAsync(page, pageSize);
        return Ok(result);
    }

    [HttpPut("jobs/{jobId}/moderate")]
    public async Task<ActionResult> ModerateJob(int jobId, [FromQuery] bool isActive)
    {
        await _adminService.ModerateJobAsync(jobId, isActive);
        return Ok(new { message = $"Job {(isActive ? "activated" : "deactivated")} successfully" });
    }

    [HttpGet("applications")]
    public async Task<ActionResult<PagedResultDto<ApplicationResponseDto>>> GetAllApplications(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _adminService.GetAllApplicationsAsync(page, pageSize);
        return Ok(result);
    }
}
