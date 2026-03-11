using Microsoft.EntityFrameworkCore;
using JobPortal.API.Models;
using JobPortal.API.DTOs;

namespace JobPortal.API.Services;

public class ResumeService
{
    private readonly JobPortalContext _db;
    private readonly IWebHostEnvironment _env;

    public ResumeService(JobPortalContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    public async Task<ResumeDto> UploadResumeAsync(int userId, IFormFile file)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException("Candidate profile not found");

        var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
        var ext = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(ext))
            throw new InvalidOperationException("Only PDF, DOC, and DOCX files are allowed");

        if (file.Length > 5 * 1024 * 1024)
            throw new InvalidOperationException("File size must be less than 5MB");

        var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads", "Resumes");
        Directory.CreateDirectory(uploadsDir);

        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, uniqueName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var resume = new Resume
        {
            CandidateId = candidate.Id,
            FileName = file.FileName,
            FilePath = filePath,
            UploadedAt = DateTime.UtcNow
        };

        _db.Resumes.Add(resume);
        await _db.SaveChangesAsync();

        return new ResumeDto
        {
            Id = resume.Id,
            FileName = resume.FileName,
            UploadedAt = resume.UploadedAt
        };
    }

    public async Task<List<ResumeDto>> GetResumesAsync(int userId)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException("Candidate profile not found");

        return await _db.Resumes
            .AsNoTracking()
            .Where(r => r.CandidateId == candidate.Id)
            .OrderByDescending(r => r.UploadedAt)
            .Select(r => new ResumeDto
            {
                Id = r.Id,
                FileName = r.FileName ?? "",
                UploadedAt = r.UploadedAt
            })
            .ToListAsync();
    }

    public async Task<(byte[] data, string fileName, string contentType)> DownloadResumeAsync(int userId, int resumeId)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException("Candidate profile not found");

        var resume = await _db.Resumes
            .FirstOrDefaultAsync(r => r.Id == resumeId && r.CandidateId == candidate.Id)
            ?? throw new KeyNotFoundException("Resume not found or unauthorized");

        if (!File.Exists(resume.FilePath))
            throw new KeyNotFoundException("Resume file not found on server");

        var data = await File.ReadAllBytesAsync(resume.FilePath);
        var ext = Path.GetExtension(resume.FileName ?? "").ToLower();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };

        return (data, resume.FileName!, contentType);
    }

    public async Task DeleteResumeAsync(int userId, int resumeId)
    {
        var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.UserId == userId)
            ?? throw new KeyNotFoundException("Candidate profile not found");

        var resume = await _db.Resumes
            .FirstOrDefaultAsync(r => r.Id == resumeId && r.CandidateId == candidate.Id)
            ?? throw new KeyNotFoundException("Resume not found or unauthorized");

        if (File.Exists(resume.FilePath))
            File.Delete(resume.FilePath!);

        _db.Resumes.Remove(resume);
        await _db.SaveChangesAsync();
    }
}
