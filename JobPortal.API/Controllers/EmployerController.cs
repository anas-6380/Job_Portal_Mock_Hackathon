using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Employer")]
public class EmployerController : ControllerBase
{
    private readonly EmployerService _employerService;

    public EmployerController(EmployerService employerService) => _employerService = employerService;

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("profile")]
    public async Task<ActionResult<EmployerProfileDto>> GetProfile()
    {
        var result = await _employerService.GetProfileAsync(GetUserId());
        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<EmployerProfileDto>> UpdateProfile([FromBody] UpdateEmployerProfileDto dto)
    {
        var result = await _employerService.UpdateProfileAsync(GetUserId(), dto);
        return Ok(result);
    }

    [HttpGet("jobs/{jobId}/applicants")]
    public async Task<ActionResult<PagedResultDto<ApplicationResponseDto>>> GetApplicants(
        int jobId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _employerService.GetApplicantsAsync(GetUserId(), jobId, page, pageSize);
        return Ok(result);
    }

    [HttpPut("applications/{applicationId}/status")]
    public async Task<ActionResult<ApplicationResponseDto>> UpdateApplicationStatus(
        int applicationId, [FromBody] UpdateApplicationStatusDto dto)
    {
        var result = await _employerService.UpdateApplicationStatusAsync(GetUserId(), applicationId, dto.Status);
        return Ok(result);
    }

    [HttpGet("resume/{applicationId}")]
    public async Task<ActionResult> DownloadApplicantResume(int applicationId)
    {
        var (data, fileName, contentType) = await _employerService.DownloadApplicantResumeAsync(GetUserId(), applicationId);
        return File(data, contentType, fileName);
    }
}
