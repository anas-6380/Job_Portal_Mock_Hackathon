using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Candidate")]
public class ResumeController : ControllerBase
{
    private readonly ResumeService _resumeService;

    public ResumeController(ResumeService resumeService) => _resumeService = resumeService;

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("upload")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<ActionResult<ResumeDto>> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        var result = await _resumeService.UploadResumeAsync(GetUserId(), file);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<ResumeDto>>> GetResumes()
    {
        var result = await _resumeService.GetResumesAsync(GetUserId());
        return Ok(result);
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult> Download(int id)
    {
        var (data, fileName, contentType) = await _resumeService.DownloadResumeAsync(GetUserId(), id);
        return File(data, contentType, fileName);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _resumeService.DeleteResumeAsync(GetUserId(), id);
        return NoContent();
    }
}
