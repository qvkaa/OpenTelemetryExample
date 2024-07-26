using System.Diagnostics.Metrics;
using System.Reflection;

namespace Client.Api.Diagnostics;

public static class CustomMetrics
{
    private const string ServiceName = "Clients.Api";
    public static readonly Meter Meter = new(Assembly.GetExecutingAssembly().GetName().Name!);

    public static readonly Counter<long> ClientsCreatedCounter = Meter.CreateCounter<long>("custom.clients.created");
}
