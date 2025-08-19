# Tournament Site Deployment Guide

This guide explains how to deploy the tournament site on an Umbrel home server using Portainer.

## Prerequisites

- Umbrel home server running
- Portainer app installed from Umbrel App Store
- Git access to your repository
- Docker and Docker Compose available (usually included with Portainer app)

## Multi-Site Architecture

This guide assumes you're running multiple websites. Each site should be deployed as a **separate stack** in Portainer for better isolation and management.

### **Recommended Structure:**
- **Stack 1**: Tournament Site (port 3000)
- **Stack 2**: PostgreSQL Site (port 3001) 
- **Stack 3**: Another Site (port 3002)
- **Stack 0**: Shared Infrastructure (optional)

## Initial Setup

### 1. Install Portainer App

First, install Portainer from the Umbrel App Store:

1. Open Umbrel in your browser
2. Go to **App Store**
3. Search for "Portainer"
4. Click **Install**
5. Wait for installation to complete
6. Note the port number (usually 9000)

### 2. Check Git Installation

Access Portainer and check if git is available in the container environment:

1. Open Portainer at `http://your-umbrel-ip:9000`
2. Go to **Containers** or **Stacks**
3. Look for any existing containers to see the environment

### 3. Clone the Repository

**Important:** Since Umbrel doesn't persist SSH changes, we'll use a different approach:

#### **Option A: Use Portainer's File Manager (Recommended)**
1. In Portainer, go to **Stacks**
2. Click **Add stack**
3. Use the **Web editor** to paste your docker-compose.yml
4. Name it `tournament-site`
5. Deploy the stack

#### **Option B: Use Git in Portainer Container**
1. Deploy a temporary container with git
2. Clone your repository inside that container
3. Copy files to a persistent volume
4. Use those files for your main stack

### 4. Create Data Directory

Since we're using Portainer, the data directories will be created automatically when the stack deploys, thanks to the volume mounts in your docker-compose.yml.

### 5. Deploy Using Portainer

1. Open Portainer at `http://your-umbrel-ip:9000`
2. Go to **Stacks**
3. Click **Add stack**
4. **Use the Web editor** and paste your docker-compose.yml content
5. Name it `tournament-site` (or your preferred name)
6. Click **Deploy the stack**

**Note:** Since Umbrel doesn't persist SSH changes, use Portainer's web interface instead of command line!

### 6. Deploy Additional Sites

For each additional site:

1. **Create a new docker-compose.yml** with different ports:
   ```yaml
   ports:
     - "3001:3000"  # Use different host port
   ```

2. **Deploy as a new stack in Portainer:**
   - Go to **Stacks** → **Add stack**
   - Use **Web editor** to paste the new docker-compose.yml
   - Name it `another-site-stack`
   - Deploy

**Note:** Each site gets its own stack, so they're completely independent!

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

### Method 1: Using Portainer (Recommended for Umbrel)

1. **Update your local repository** (on your development machine)
2. **Push changes to GitHub**
3. **In Portainer:**
   - Go to your stack
   - Click **Editor**
   - Update the docker-compose.yml if needed
   - Click **Update the stack**

### Method 2: Rebuild from Source

1. **In Portainer, go to your stack**
2. **Click the stack name to expand it**
3. **Click the container name**
4. **Go to Container → Console**
5. **Use the web terminal to pull updates** (if git is available)

### Method 3: Manual Rebuild

1. **Stop the stack** in Portainer
2. **Delete the stack** (this removes the container)
3. **Recreate the stack** with updated code

### Method 4: Using Portainer (Alternative)

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

- **Container Port**: 3000 (internal)
- **Host Port**: Varies by site (3000, 3001, 3002, etc.)

**Port Assignment:**
- Tournament Site: `3000:3000`
- PostgreSQL Site: `3001:3000`
- Another Site: `3002:3000`
- Additional Sites: `3003:3000`, `3004:3000`, etc.

### Multi-Site Management

Each site runs independently:
- **Separate stacks** in Portainer
- **Independent updates** and restarts
- **Isolated networks** for security
- **Different update cycles** possible

### Volume Mounts

- `./data:/app/data` - Tournament data persistence
- `./logs:/app/logs` - Application logs

## Troubleshooting

### Container Won't Start

1. **In Portainer, go to your stack**
2. **Click on the container name**
3. **Go to Container → Logs** to see error messages
4. **Check Container → Inspect** for configuration issues

### Permission Issues

Since you're using Portainer, permission issues are usually handled automatically. If you encounter problems:

1. **Check the container logs** in Portainer
2. **Verify volume mounts** are correct in your docker-compose.yml
3. **Ensure the container user** has access to mounted directories

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

- **Update your local repository** weekly on your development machine
- **Push changes to GitHub** when ready
- **Rebuild stacks in Portainer** as needed
- **Monitor container logs** for errors in Portainer

### Backup

Since you're using Portainer, backups are handled through the volume mounts:

1. **Your tournament data** is stored in persistent volumes
2. **Container logs** are available in Portainer
3. **Stack configurations** are saved in Portainer
4. **For additional backup**, you can export your stack configuration from Portainer

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
