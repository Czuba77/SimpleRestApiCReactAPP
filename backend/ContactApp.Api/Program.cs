using Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
}

app.MapGet("/api/contacts", (ApplicationDbContext dbContext, int id) => 
{
    var contact = dbContext.Contacts.Find(id);

    if (contact is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(contact);
})
.WithName("GetContactById");

app.MapPost("/api/contacts", (ApplicationDbContext dbContext, Contact newContact) =>
{
    dbContext.Contacts.Add(newContact);
    dbContext.SaveChanges();
    return Results.Created($"/api/contacts/{newContact.Id}", newContact);
})
.WithDescription("Creates a new contact")
.WithName("CreateContact");

app.Run();


