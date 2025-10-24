using Models;
using Controllers;
using Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<GamesContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
builder.Services.AddControllers();


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


string[]? allowedOrigins = builder.Configuration.GetSection("CORS:AllowedOriginsFrontend").Get<string[]>();
if( allowedOrigins != null )
  builder.Services.AddCors(options =>
  {
    options.AddPolicy("AllowFrontends",
        policy =>
        {
          policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // required for cookies
        });
  });


var app = builder.Build(); 

app.UseCors("AllowFrontends"); 


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.MapControllers();
app.Run();

