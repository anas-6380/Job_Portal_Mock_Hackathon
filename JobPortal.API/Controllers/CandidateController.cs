using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Candidate")]
public class CandidateController : ControllerBase
{
    private readonly CandidateService _candidateService;

    public CandidateController(CandidateService candidateService) => _candidateService = candidateService;

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("profile")]
    public async Task<ActionResult<CandidateProfileDto>> GetProfile()
    {
        var result = await _candidateService.GetProfileAsync(GetUserId());
        return Ok(result);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<CandidateProfileDto>> UpdateProfile([FromBody] UpdateCandidateProfileDto dto)
    {
        var result = await _candidateService.UpdateProfileAsync(GetUserId(), dto);
        return Ok(result);
    }

    [HttpPost("apply")]
    public async Task<ActionResult<ApplicationResponseDto>> ApplyForJob([FromBody] ApplyJobDto dto)
    {
        var result = await _candidateService.ApplyForJobAsync(GetUserId(), dto);
        return Ok(result);
    }

    [HttpGet("applications")]
    public async Task<ActionResult<PagedResultDto<ApplicationResponseDto>>> GetApplications(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _candidateService.GetApplicationsAsync(GetUserId(), page, pageSize);
        return Ok(result);
    }
}
