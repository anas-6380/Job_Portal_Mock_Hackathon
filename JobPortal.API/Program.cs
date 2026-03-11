using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using JobPortal.API.Models;
using JobPortal.API.Middleware;
using JobPortal.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ───
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<JobPortalContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// ─── Services ───
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JobService>();
builder.Services.AddScoped<CandidateService>();
builder.Services.AddScoped<EmployerService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<ResumeService>();

// ─── JWT Authentication ───
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

builder.Services.AddAuthorization();

// ─── CORS ───
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ─── Controllers + Swagger ───
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Job Portal API",
        Version = "v1",
        Description = "HCL AntiGrav Job Portal - Hackathon Edition"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ─── Middleware Pipeline ───
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ─── Seed Admin User ───
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<JobPortalContext>();
    try
    {
        // Verify connection to existing MySQL database (database-first)
        if (!await db.Database.CanConnectAsync())
        {
            Console.WriteLine("❌ Cannot connect to MySQL database 'job_portal'. Make sure it exists and MySQL is running.");
            return;
        }

        // Seed roles if empty
        if (!await db.Roles.AnyAsync())
        {
            db.Roles.AddRange(
                new JobPortal.API.Models.Role { Name = "Admin" },
                new JobPortal.API.Models.Role { Name = "Employer" },
                new JobPortal.API.Models.Role { Name = "Candidate" }
            );
            await db.SaveChangesAsync();
        }

        // Seed admin if not exists
        if (!await db.Users.AnyAsync(u => u.Email == "admin@jobportal.com"))
        {
            var adminRole = await db.Roles.FirstAsync(r => r.Name == "Admin");
            db.Users.Add(new JobPortal.API.Models.User
            {
                RoleId = adminRole.Id,
                FirstName = "System",
                LastName = "Admin",
                Email = "admin@jobportal.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Anas@123"),
                Phone = "0000000000",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }

        Console.WriteLine("✅ Database seeded successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Database seed warning: {ex.Message}");
    }
}

app.Run();
