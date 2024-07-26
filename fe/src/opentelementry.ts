import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
//exporters
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

// The SemanticResourceAttributes is an enum that provides a set of predefined attribute keys for commonly used attributes in OpenTelemetry to maintain consistency across different OpenTelemetry implementations
const resourceSettings = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: "open-telemetry-react",
  [SemanticResourceAttributes.SERVICE_VERSION]: "0.0.1",
});

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4319/v1/traces",
});

const provider = new WebTracerProvider({ resource: resourceSettings });

// The BatchSpanProcessor is responsible for batching and exporting spans to the configured exporter (newRelicExporter in this case).
provider.addSpanProcessor(
  new BatchSpanProcessor(
    traceExporter
    //Optional BatchSpanProcessor Configurations
  )
);

// ZoneContextManager is a context manager implementation based on the Zone.js library. It enables context propagation within the application using zones.
provider.register({
  contextManager: new ZoneContextManager(),
  // Configure the propagator to enable context propagation between services using the W3C Trace Headers
  propagator: new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
  }),
});

const startOtelInstrumentation = () => {
  console.error(`Registering Otel ${new Date().getMilliseconds()}`);
  // Registering instrumentations
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-xml-http-request": {
          enabled: true,
          ignoreUrls: ["/localhost:8081/sockjs-node"],
          clearTimingResources: true,
          propagateTraceHeaderCorsUrls: [new RegExp("http://localhost:8080")], //backend url
        },
        "@opentelemetry/instrumentation-document-load": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-user-interaction": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-fetch": {
          propagateTraceHeaderCorsUrls: [new RegExp("http://localhost:8080")], //backend url
          enabled: true,
        },
      }),
    ],
  });
};

export { startOtelInstrumentation };
