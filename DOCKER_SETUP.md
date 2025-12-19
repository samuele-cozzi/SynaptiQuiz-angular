# Docker Setup Guide for SynaptiQuiz

## Files Created

1. **Dockerfile** - Multi-stage build:
   - Stage 1: Builds Angular app using Node 20-alpine
   - Stage 2: Serves built app with `http-server` on port 4200
   - Includes health check

2. **.github/workflows/docker-publish.yml** - GitHub Actions workflow:
   - Triggers on push to `main` and `self-hosting` branches
   - Also triggers on git tags (v*)
   - Builds and publishes to Docker Hub
   - Includes caching for faster builds
   - Pushes only on non-PR events

## Setup Instructions

### 1. Create Docker Hub Credentials

Go to [Docker Hub](https://hub.docker.com) and:
- Create an account if you don't have one
- Generate an access token: Settings → Security → New Access Token

### 2. Configure GitHub Secrets

In your GitHub repository:
1. Go to **Settings → Secrets and variables → Actions**
2. Add two new secrets:
   - `DOCKER_HUB_USERNAME`: Your Docker Hub username
   - `DOCKER_HUB_TOKEN`: Your Docker Hub access token

### 3. Test Locally (Optional)

Build the Docker image locally:
```bash
docker build -t synaptiquiz:latest .
```

Run the container:
```bash
docker run -p 4200:4200 synaptiquiz:latest
```

Then visit `http://localhost:4200` in your browser.

### 4. Push to Trigger Workflow

The workflow automatically triggers on:
- Push to `main` branch → publishes as `latest` and `main` tag
- Push to `self-hosting` branch → publishes as `self-hosting` tag
- Creating a git tag like `v1.0.0` → publishes with semantic versioning tags

Example:
```bash
git tag v1.0.0
git push origin v1.0.0
```

This will publish images as:
- `yourusername/synaptiquiz:v1.0.0`
- `yourusername/synaptiquiz:1.0`
- `yourusername/synaptiquiz:1`

## Docker Image Usage

Once published, users can pull and run your image:
```bash
docker pull yourusername/synaptiquiz:latest
docker run -p 4200:4200 yourusername/synaptiquiz:latest
```

Or with Docker Compose:
```yaml
version: '3.8'
services:
  synaptiquiz:
    image: yourusername/synaptiquiz:latest
    ports:
      - "4200:4200"
```

## Environment Configuration

If you need to pass environment variables to the container, you can modify the Dockerfile's `CMD` or use Docker's `-e` flag:

```bash
docker run -p 4200:4200 \
  -e FIREBASE_CONFIG='...' \
  yourusername/synaptiquiz:latest
```

## Notes

- The build uses Node 20-alpine for minimal image size
- Health checks are configured to verify the app is running
- Caching is enabled for faster GitHub Actions builds
- The workflow skips Docker Hub push for pull requests
