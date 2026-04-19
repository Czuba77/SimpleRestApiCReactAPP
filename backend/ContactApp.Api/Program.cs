using Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtSection = builder.Configuration.GetSection("Jwt");
var signingKey = jwtSection["Key"] ?? throw new InvalidOperationException("Missing JWT key.");

var byteKey = Encoding.UTF8.GetBytes(signingKey);


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(byteKey)
        };
    });
builder.Services.AddAuthorization();

var frontendUrl = builder.Configuration.GetValue<string>("FrontendUrl") ?? "http://localhost:5173";

builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend",
    policy =>
    {
        policy.WithOrigins(frontendUrl)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();

    if (!dbContext.Categories.Any())
    {
        var catBusiness = new Category { Name = "business" };
        var catPrivate = new Category { Name = "private" };
        var catOther = new Category { Name = "other" };

        dbContext.Categories.AddRange(catBusiness, catPrivate, catOther);
        dbContext.SaveChanges(); // Zapisujemy, żeby kategorie wygenerowały sobie numery ID

        var sub1 = new Subcategory { Name = "boss", CategoryId = catBusiness.Id };
        var sub2 = new Subcategory { Name = "client", CategoryId = catBusiness.Id };
        var sub3 = new Subcategory { Name = "colleague", CategoryId = catBusiness.Id };

        dbContext.Subcategories.AddRange(sub1, sub2, sub3);
        dbContext.SaveChanges();
    }
}

app.MapGet("/api/contacts/{id}", (ApplicationDbContext dbContext, int id) => 
{
    var contact = dbContext.Contacts
        .Include(c => c.Category)
        .Include(c => c.Subcategory)
        .FirstOrDefault(c => c.Id == id);

    if (contact is null)
    {
        return Results.NotFound();
    }

    contact.PasswordHash = string.Empty;

    return Results.Ok(contact);
})
.WithName("GetContactById");

app.MapGet("/api/categories", (ApplicationDbContext dbContext) => dbContext.Categories.ToList())
.WithName("GetCategories");

app.MapGet("/api/subcategories", (ApplicationDbContext dbContext) => dbContext.Subcategories.ToList())
.WithName("GetSubcategories");


app.MapGet("/api/contacts", (ApplicationDbContext dbContext) =>
{
    var contacts = dbContext.Contacts
    .Include(c => c.Category)
    .Select(c => new
    {
        c.Id,
        c.FirstName,
        c.LastName,
        c.Email,
        CategoryName = c.Category != null ? c.Category.Name : "None"
    })
    .ToList();
    return Results.Ok(contacts);
}); 

//adding contact
app.MapPost("/api/contacts", (ApplicationDbContext dbContext, Contact newContact) =>
{
    if (dbContext.Contacts.Any(c => c.Email == newContact.Email))
    {
        return Results.Conflict("Email already taken.");
    }
    if (string.IsNullOrWhiteSpace(newContact.PasswordHash) || newContact.PasswordHash.Length < 9)
    {
        return Results.BadRequest("Password should be at least 9 characters long.");
    }

    newContact.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newContact.PasswordHash);

    var category = dbContext.Categories.Find(newContact.CategoryId);
    if (category == null)
        return Results.BadRequest("Invalid category.");

    if (category.Name == "business" && newContact.SubcategoryId == null)
        return Results.BadRequest("Business category needs subcategory.");
    else if (category.Name == "other" && string.IsNullOrWhiteSpace(newContact.CustomSubcategory))
        return Results.BadRequest("'Other' option requires subcategory.");

    dbContext.Contacts.Add(newContact);
    dbContext.SaveChanges();

    newContact.PasswordHash = string.Empty;
    return Results.Created($"/api/contacts/{newContact.Id}", newContact);
})
.WithName("CreateContact")
.RequireAuthorization();

//editing contact
app.MapPut("/api/contacts/{id}", (ApplicationDbContext dbContext, int id, Contact updatedContact) =>
{
    var contact = dbContext.Contacts.Find(id);
    if (contact is null) return Results.NotFound();

    if (dbContext.Contacts.Any(c => c.Email == updatedContact.Email && c.Id != id))
    {
        return Results.Conflict("Email already taken by another contact.");
    }

    var category = dbContext.Categories.Find(updatedContact.CategoryId);
    if (category == null) return Results.BadRequest("Empty category.");

    if (category.Name == "business" && updatedContact.SubcategoryId == null)
        return Results.BadRequest("Business category needs  subcategory.");
    else if (category.Name == "other" && string.IsNullOrWhiteSpace(updatedContact.CustomSubcategory))
        return Results.BadRequest("'Other' option requires subcategory.");

    contact.FirstName = updatedContact.FirstName;
    contact.LastName = updatedContact.LastName;
    contact.Email = updatedContact.Email;
    contact.Phone = updatedContact.Phone;
    contact.DateOfBirth = updatedContact.DateOfBirth;
    contact.CategoryId = updatedContact.CategoryId;
    contact.SubcategoryId = updatedContact.SubcategoryId;
    contact.CustomSubcategory = updatedContact.CustomSubcategory;

    if (!string.IsNullOrWhiteSpace(updatedContact.PasswordHash))
    {
        if (updatedContact.PasswordHash.Length < 9) return Results.BadRequest("Password should be at least 9 characters long.");
         contact.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updatedContact.PasswordHash);
    }

    dbContext.SaveChanges();
    return Results.NoContent();
})
.WithName("UpdateContact")
.RequireAuthorization();

app.MapDelete("/api/contacts/{id}", (ApplicationDbContext dbContext, int id) =>
{
    var contact = dbContext.Contacts.Find(id);
    if (contact is null) return Results.NotFound();

    dbContext.Contacts.Remove(contact);
    dbContext.SaveChanges();

    return Results.NoContent();
})
.WithName("DeleteContact")
.RequireAuthorization();

//Registartion endpoint
app.MapPost("/api/auth/register", (ApplicationDbContext dbContext, AppUser requestUser) =>
{
    if (dbContext.Users.Any(u => u.Email == requestUser.Email))
        return Results.Conflict("User with this email already exists.");
    
    var newUser = new AppUser
    {
        Email = requestUser.Email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(requestUser.PasswordHash)
    };
    dbContext.Users.Add(newUser);
    dbContext.SaveChanges();

    return Results.Ok("Successfully registered.");
});

app.MapPost("/api/auth/login", (ApplicationDbContext dbContext, IConfiguration configuration, AppUser requestUser) => 
{
    var existingUser = dbContext.Users.FirstOrDefault(x => x.Email == requestUser.Email);

    if (existingUser == null || !BCrypt.Net.BCrypt.Verify(requestUser.PasswordHash,existingUser.PasswordHash))
        return Results.Unauthorized();
    
    var jwtSection = configuration.GetSection("Jwt");
    var tokenDescriptor = new SecurityTokenDescriptor{
        Subject = new System.Security.Claims.ClaimsIdentity( new[]{
            new System.Security.Claims.Claim("sub",existingUser.Id.ToString()),
            new System.Security.Claims.Claim("email", existingUser.Email)
        }),
        Expires = DateTime.UtcNow.AddMinutes(int.Parse(jwtSection["ExpiresInMinutes"]!)),
        Issuer = jwtSection["Issuer"],
        Audience = jwtSection["Audience"],
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!)),
            SecurityAlgorithms.HmacSha256Signature
        )
    };




    var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    var securityToken = tokenHandler.CreateToken(tokenDescriptor);
    var tokenString = tokenHandler.WriteToken(securityToken);

    return Results.Ok(new {Token = tokenString});
});

app.Run();


