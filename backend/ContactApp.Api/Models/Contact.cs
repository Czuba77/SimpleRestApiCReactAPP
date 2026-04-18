namespace Models;

public class Contact
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }

    public int CategoryId { get; set; }
    public int? SubcategoryId { get; set; }
    public string? CustomSubcategory { get; set; }
}