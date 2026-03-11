using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using JobPortal.API.Models;
using JobPortal.API.DTOs;

namespace JobPortal.API.Services;

public class AuthService
{
    private readonly JobPortalContext _db;
    private readonly IConfiguration _config;

    public AuthService(JobPortalContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email already registered");

        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == dto.Role)
            ?? throw new KeyNotFoundException("Invalid role");

        if (dto.Role == "Admin")
            throw new InvalidOperationException("Cannot register as Admin");

        var user = new User
        {
            RoleId = role.Id,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        if (dto.Role == "Employer")
        {
            _db.Employers.Add(new Employer
            {
                UserId = user.Id,
                CompanyName = dto.CompanyName,
                CompanyWebsite = dto.CompanyWebsite,
                CompanyLocation = dto.CompanyLocation
            });
        }
        else
        {
            _db.Candidates.Add(new Candidate
            {
                UserId = user.Id,
                Headline = dto.Headline,
                Skills = dto.Skills
            });
        }

        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = GenerateJwtToken(user, role.Name),
            Email = user.Email!,
            Role = role.Name,
            FirstName = user.FirstName!,
            LastName = user.LastName!,
            UserId = user.Id
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new KeyNotFoundException("Invalid email or password");

        if (!user.IsActive)
            throw new InvalidOperationException("Account is deactivated");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new KeyNotFoundException("Invalid email or password");

        return new AuthResponseDto
        {
            Token = GenerateJwtToken(user, user.Role!.Name),
            Email = user.Email!,
            Role = user.Role.Name,
            FirstName = user.FirstName!,
            LastName = user.LastName!,
            UserId = user.Id
        };
    }

    private string GenerateJwtToken(User user, string role)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.GivenName, user.FirstName ?? ""),
            new Claim(ClaimTypes.Surname, user.LastName ?? "")
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryInMinutes"]!)),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
