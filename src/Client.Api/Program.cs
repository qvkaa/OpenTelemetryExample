using Client.Api.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                      });
});

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.AddOpenTelemetry();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var notificationUrl = builder.Configuration["notificationApiUrl"];
builder.Services.AddHttpClient("notification", c =>
{
    c.BaseAddress = new Uri(notificationUrl!);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

//app.UseOpenTelemetryPrometheusScrapingEndpoint();
app.UseHttpsRedirection();

app.UseCors();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/api/clients", async (IHttpClientFactory httpClientFactory, ILogger<Program> logger) =>
{
    logger.LogInformation("Hello from client api");
    CustomMetrics.ClientsCreatedCounter.Add(1);
    var httpClient = httpClientFactory.CreateClient("notification");
    var response = await httpClient.GetAsync("api/notifications");
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("CreateClient")
.WithOpenApi();

app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
