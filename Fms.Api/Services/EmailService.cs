using System.Net;
using System.Net.Mail;

namespace Fms.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpSettings = _config.GetSection("Smtp");

        using var client = new SmtpClient(smtpSettings["Host"], int.Parse(smtpSettings["Port"]))
        {
            Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
            EnableSsl = true
        };

        var mail = new MailMessage
        {
            From = new MailAddress(smtpSettings["Username"], "FMS System"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mail.To.Add(toEmail);

        await client.SendMailAsync(mail);
    }
}