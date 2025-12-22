# MQTT Explorer - Docker Browser Mode

Docker image for running MQTT Explorer in browser mode.

## Try It Now

[![Try in PWD](https://raw.githubusercontent.com/play-with-docker/stacks/master/assets/images/button.png)](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/thomasnordquist/MQTT-Explorer/master/docker-compose.yml)

Click the badge above to instantly try MQTT Explorer in your browser using Play with Docker (requires free Docker Hub account).

## Quick Start

### Using Pre-built Image

Pull and run the latest image from GitHub Container Registry:

```bash
docker pull ghcr.io/thomasnordquist/mqtt-explorer:latest

docker run -d \
  -p 3000:3000 \
  -e MQTT_EXPLORER_USERNAME=admin \
  -e MQTT_EXPLORER_PASSWORD=your_secure_password \
  -v mqtt-explorer-data:/app/data \
  --name mqtt-explorer \
  ghcr.io/thomasnordquist/mqtt-explorer:latest
```

Access the application at `http://localhost:3000`

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  mqtt-explorer:
    image: ghcr.io/thomasnordquist/mqtt-explorer:latest
    ports:
      - "3000:3000"
    environment:
      - MQTT_EXPLORER_USERNAME=admin
      - MQTT_EXPLORER_PASSWORD=your_secure_password
      - PORT=3000
    volumes:
      - mqtt-explorer-data:/app/data
    restart: unless-stopped

volumes:
  mqtt-explorer-data:
```

Then run:

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MQTT_EXPLORER_USERNAME` | No | Generated | Username for authentication |
| `MQTT_EXPLORER_PASSWORD` | No | Generated | Password for authentication |
| `PORT` | No | `3000` | Port the server listens on |

**Note**: If credentials are not provided, they will be auto-generated and stored in `/app/data/credentials.json`. Check the container logs to see the generated credentials:

```bash
docker logs mqtt-explorer
```

## Data Persistence

The container stores data in `/app/data`, including:
- User credentials (`credentials.json`)
- Connection settings (`settings.json`)
- Uploaded certificates (`certificates/`)
- File uploads (`uploads/`)

Mount a volume to persist data across container restarts:

```bash
docker run -v mqtt-explorer-data:/app/data ...
```

## Building from Source

Build the Docker image locally:

```bash
docker build -f Dockerfile.browser -t mqtt-explorer:local .
```

Run the locally built image:

```bash
docker run -d \
  -p 3000:3000 \
  -e MQTT_EXPLORER_USERNAME=admin \
  -e MQTT_EXPLORER_PASSWORD=secret \
  mqtt-explorer:local
```

## Health Check

The container includes a health check that runs every 30 seconds. Check the health status:

```bash
docker inspect --format='{{.State.Health.Status}}' mqtt-explorer
```

## Security Best Practices

1. **Use HTTPS in Production**: Put the container behind a reverse proxy (nginx, Traefik) with HTTPS
2. **Set Strong Credentials**: Always set custom credentials via environment variables
3. **Network Isolation**: Run in a private network when possible
4. **Update Regularly**: Pull the latest image regularly for security updates

### Example with Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name mqtt-explorer.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Container won't start

Check the logs:
```bash
docker logs mqtt-explorer
```

### Can't access the application

1. Verify the container is running: `docker ps`
2. Check the port mapping: `docker port mqtt-explorer`
3. Test connectivity: `curl http://localhost:3000`

### Authentication issues

1. Check generated credentials in logs: `docker logs mqtt-explorer`
2. Verify environment variables: `docker inspect mqtt-explorer`
3. Reset credentials by removing the data volume and restarting

### Permission issues

The container runs as a non-root user (UID 1001). If mounting host directories, ensure they're writable:

```bash
chown -R 1001:1001 /path/to/host/data
docker run -v /path/to/host/data:/app/data ...
```

## Available Tags

- `latest` - Latest stable version from the master branch
- `master` - Latest build from master branch
- `beta` - Latest beta version
- `release` - Latest release version
- `master-<sha>` - Specific commit from master
- `beta-<sha>` - Specific commit from beta
- `release-<sha>` - Specific commit from release

## Supported Platforms

The Docker image is built for multiple architectures:
- `linux/amd64` - x86-64 (standard PCs, servers)
- `linux/arm64` - ARM 64-bit (Raspberry Pi 3/4/5, Apple Silicon)
- `linux/arm/v7` - ARM 32-bit (Raspberry Pi 2/3)

## One-Click Deployment Options

### Play with Docker (Free)

Try MQTT Explorer instantly in your browser without installing anything:

[![Try in PWD](https://raw.githubusercontent.com/play-with-docker/stacks/master/assets/images/button.png)](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/thomasnordquist/MQTT-Explorer/master/docker-compose.yml)

- **No installation required** - Runs entirely in your browser
- **Free to use** - Requires only a Docker Hub account
- **Perfect for demos** - Great for testing and demonstrations
- **4-hour sessions** - Sessions automatically expire after 4 hours

### Cloud Platforms

Deploy MQTT Explorer to various cloud platforms with one click:

#### DigitalOcean App Platform

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/thomasnordquist/MQTT-Explorer/tree/master&refcode=docker)

- Automatically detects Docker configuration
- Managed platform with auto-scaling
- Starting at $5/month

#### Koyeb

[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=docker&name=mqtt-explorer&image=ghcr.io/thomasnordquist/mqtt-explorer:latest&ports=3000;http;/)

- Deploy directly from Docker image
- Global edge network
- Free tier available

**Note:** Remember to set the environment variables `MQTT_EXPLORER_USERNAME` and `MQTT_EXPLORER_PASSWORD` when deploying to cloud platforms.

## License

See the main [LICENSE.md](LICENSE.md) file.
