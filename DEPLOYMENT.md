# Tournament Site Deployment Guide

This guide explains how to deploy the tournament site on an Umbrel home server using Portainer.

## Prerequisites

- Umbrel home server running
- Portainer installed and accessible
- Git access to your repository
- Docker and Docker Compose available on the server

## Initial Setup

### 1. Clone the Repository

On your Umbrel server, clone your repository:

```bash
git clone <your-repository-url>
cd tournament-site
```

### 2. Create Data Directory

Create the data directory for persistent storage:

```bash
mkdir -p data logs
chmod 755 data logs
```

### 3. Build and Deploy

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Initial deployment
docker-compose up -d --build
```

## Using Portainer

### 1. Access Portainer

- Open Portainer in your browser
- Navigate to your Umbrel server environment

### 2. Deploy the Stack

1. Go to **Stacks** in Portainer
2. Click **Add stack**
3. Upload the `docker-compose.yml` file
4. Name it `tournament-site`
5. Click **Deploy the stack**

### 3. Monitor the Container

- Go to **Containers** to see your running container
- Check logs if needed
- Monitor resource usage

## Updating the Site

### Method 1: Using the Deployment Script (Recommended)

```bash
# On your Umbrel server
cd tournament-site
./deploy.sh
```

### Method 2: Manual Update

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Method 3: Using Portainer

1. In Portainer, go to **Stacks**
2. Find your `tournament-site` stack
3. Click **Editor** to modify the compose file
4. Update the image or rebuild
5. Click **Update the stack**

## Configuration

### Environment Variables

The site uses these environment variables:
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

### Port Configuration

- **Container Port**: 3000
- **Host Port**: 3000 (change in docker-compose.yml if needed)

### Volume Mounts

- `./data:/app/data` - Tournament data persistence
- `./logs:/app/logs` - Application logs

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps
```

### Port Already in Use

Change the host port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead of 3000
```

### Permission Issues

```bash
# Fix data directory permissions
chown -R 1001:1001 data logs
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

## Maintenance

### Regular Updates

- Pull updates weekly: `git pull origin main`
- Rebuild container monthly: `docker-compose up -d --build`
- Monitor logs for errors

### Backup

```bash
# Backup data directory
tar -czf tournament-backup-$(date +%Y%m%d).tar.gz data/
```

### Health Check

The site should be accessible at `http://your-server-ip:3000`

## Security Notes

- Keep your Umbrel server updated
- Use strong passwords for admin access
- Consider using a reverse proxy (Nginx) for SSL
- Restrict access to admin panel if needed

## Support

For issues:
1. Check container logs in Portainer
2. Verify git repository access
3. Check server resources (CPU, memory, disk)
4. Ensure Docker and Docker Compose are working
