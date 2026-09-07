# mqtt-explorer

## Installing the Chart

Deploy MQTT Explorer browser mode from the local chart:

```console
helm upgrade --install mqtt-explorer ./chart \
  --namespace mqtt-explorer \
  --create-namespace
```

Point the chart at the published image and inject credentials or API keys with
`secretEnv`:

```console
helm upgrade --install mqtt-explorer ./chart \
  --namespace mqtt-explorer \
  --create-namespace \
  --set secretEnv.MQTT_EXPLORER_USERNAME=admin \
  --set secretEnv.MQTT_EXPLORER_PASSWORD=change-me \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=mqtt-explorer.example.com
```

The chart targets the browser-mode container documented in `DOCKER.md`. It
creates a `Deployment`, `Service`, optional `Ingress`, optional PVC, and
optional `NetworkPolicy`.

`env` is intended for non-sensitive settings such as `PORT` and `NODE_ENV`.
Use `secretEnv` for credentials and LLM API keys such as
`MQTT_EXPLORER_PASSWORD`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `LLM_API_KEY`.
Use `extraVolumes` and `extraVolumeMounts` when you need to mount additional
Kubernetes secrets or config maps, for example TLS material referenced by
`MQTT_AUTO_CONNECT_*_FILE` environment variables.

Persistence mounts `/app/data`, which stores credentials, connection settings,
uploaded certificates, and file uploads. Leave `persistence.enabled=true` for
stateful deployments.

`networkPolicy` is disabled by default because MQTT Explorer often needs egress
to arbitrary MQTT brokers and optionally to external LLM APIs. When enabling
it, define matching ingress and egress rules for your environment.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `replicaCount` | int | `1` | Number of MQTT Explorer pods. |
| `strategy.type` | string | `"Recreate"` | Deployment strategy; `Recreate` avoids PVC attach conflicts for single replica storage. |
| `image.repository` | string | `"ghcr.io/thomasnordquist/mqtt-explorer"` | Container image repository. |
| `image.tag` | string | `"latest"` | Container image tag. |
| `deploymentAnnotations` | object | `{}` | Annotations added to the `Deployment` resource. |
| `service.type` | string | `"ClusterIP"` | Kubernetes Service type. |
| `service.port` | int | `3000` | Service port exposed to clients. |
| `ingress.enabled` | bool | `false` | Creates an Ingress resource. |
| `env` | object | `{"NODE_ENV":"production","PORT":"3000"}` | Non-sensitive container environment variables. |
| `secretEnv` | object | `{}` | Sensitive environment variables rendered into a Secret and mounted as env vars. |
| `extraVolumeMounts` | list | `[]` | Additional container `volumeMounts`. |
| `persistence.enabled` | bool | `true` | Mounts persistent storage at `/app/data`. |
| `persistence.existingClaim` | string | `""` | Existing PVC name to use instead of creating one. |
| `persistence.size` | string | `"1Gi"` | Requested PVC size. |
| `probes.startup.enabled` | bool | `true` | Enables the HTTP startup probe. |
| `probes.liveness.enabled` | bool | `true` | Enables the HTTP liveness probe. |
| `probes.readiness.enabled` | bool | `true` | Enables the HTTP readiness probe. |
| `podSecurityContext` | object | `{"fsGroup":1001,"runAsGroup":1001,"runAsNonRoot":true,"runAsUser":1001}` | Pod-level security context aligned with the image UID/GID. |
| `containerSecurityContext` | object | `{"allowPrivilegeEscalation":false,"capabilities":{"drop":["ALL"]}}` | Hardened container security context. |
| `extraVolumes` | list | `[]` | Additional pod `volumes`. |
| `networkPolicy.enabled` | bool | `false` | Creates a network policy for the pods. |
| `networkPolicy.flavor` | string | `"kubernetes"` | Policy implementation: `kubernetes` or `cilium`. |
