using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly JobService _jobService;

    public JobsController(JobService jobService) => _jobService = jobService;

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<JobResponseDto>>> GetJobs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? search = null,
        [FromQuery] string? location = null,
        [FromQuery] string? jobType = null,
        [FromQuery] int? minExp = null)
    {
        var result = await _jobService.GetJobsAsync(page, pageSize, search, location, jobType, minExp);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobResponseDto>> GetJob(int id)
    {
        var result = await _jobService.GetJobByIdAsync(id);
        return Ok(result);
    }

    [Authorize(Roles = "Employer")]
    [HttpPost]
    public async Task<ActionResult<JobResponseDto>> CreateJob([FromBody] CreateJobDto dto)
    {
        var result = await _jobService.CreateJobAsync(GetUserId(), dto);
        return CreatedAtAction(nameof(GetJob), new { id = result.Id }, result);
    }

    [Authorize(Roles = "Employer")]
    [HttpPut("{id}")]
    public async Task<ActionResult<JobResponseDto>> UpdateJob(int id, [FromBody] UpdateJobDto dto)
    {
        var result = await _jobService.UpdateJobAsync(GetUserId(), id, dto);
        return Ok(result);
    }

    [Authorize(Roles = "Employer")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> SoftDeleteJob(int id)
    {
        await _jobService.SoftDeleteJobAsync(GetUserId(), id);
        return NoContent();
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("my-jobs")]
    public async Task<ActionResult<PagedResultDto<JobResponseDto>>> GetMyJobs(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _jobService.GetEmployerJobsAsync(GetUserId(), page, pageSize);
        return Ok(result);
    }
}
