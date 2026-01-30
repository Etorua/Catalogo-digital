# Configuration
$PEM_FILE = "bienestaradmin.pem"
$SERVER_IP = "3.129.21.247"
$USER = "ubuntu"
$REMOTE_DIR = "/home/ubuntu/app"

# Fix permissions for PEM key (Windows specific, needed for OpenSSH)
# In standard Powershell we can't easily do chmod 400. 
# We assume the user has handled this or we try to use it as is. 
# Often Windows SSH client is okay if specific ACLs are set, but let's try.

Write-Host "Starting Deployment to $SERVER_IP..."

# 1. Create remote directory
Write-Host "Creating remote directory..."
ssh -i $PEM_FILE -o StrictHostKeyChecking=no $USER@$SERVER_IP "mkdir -p $REMOTE_DIR"

# 2. Upload Files (Excluding node_modules to save time/bandwidth)
Write-Host "Uploading files..."
# We use scp recursively. To exclude node_modules, it's better to use tar locally then scp, or careful scp.
# Windows doesn't have tar by default easily usable for this. 
# We will use scp but it might be slow if we include node_modules. 
# We should try to exclude node_modules.
# Simpler: Create a zip/tar locally if possible, or upload folders one by one excluding modules.

# Let's try raw scp but it will be better to not upload node_modules.
# Since I can't easily exclude with standard scp on windows, I'll instruct the shell to ignore them if possible.
# Actually, standard scp doesn't have --exclude.
# I will zip the folders using Powershell Compress-Archive which is standard in PS 5.1+

Write-Host "Zipping folders (skipping node_modules)..."
If (Test-Path "deploy_package.zip") { Remove-Item "deploy_package.zip" }

# This might be heavy if there are many files.
# Compress-Archive is slow.
# Fast alternative: Just upload package.json and src.

# Create a temp dir
$TEMP_DIR = "temp_deploy"
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null
New-Item -ItemType Directory -Force -Path "$TEMP_DIR\client" | Out-Null
New-Item -ItemType Directory -Force -Path "$TEMP_DIR\server" | Out-Null
New-Item -ItemType Directory -Force -Path "$TEMP_DIR\deploy" | Out-Null

# Copy Server files
Copy-Item "server\*" -Destination "$TEMP_DIR\server" -Exclude "node_modules", ".env" -Recurse
# Copy Client files
Copy-Item "client\*" -Destination "$TEMP_DIR\client" -Exclude "node_modules", "dist", ".env" -Recurse
# Copy Deploy files
Copy-Item "deploy\*" -Destination "$TEMP_DIR\deploy" -Recurse
# Copy Root files
Copy-Item "README.md" -Destination "$TEMP_DIR"

Write-Host "Compressing..."
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath "deploy_package.zip"

Write-Host "Uploading zip..."
scp -i $PEM_FILE -o StrictHostKeyChecking=no deploy_package.zip "$USER@${SERVER_IP}:${REMOTE_DIR}/deploy_package.zip"

# Clean up
Remove-Item -Recurse -Force $TEMP_DIR
Remove-Item "deploy_package.zip"

# 3. Remote Setup
Write-Host "Running remote setup..."
# We use a single line command to avoid CRLF issues in the SSH command string itself.
# We also install dos2unix to fix the uploaded script line endings.
$SCRIPT = "cd $REMOTE_DIR; sudo apt-get update; sudo apt-get install -y unzip dos2unix; unzip -o deploy_package.zip; find . -type f -name '*.sh' -exec dos2unix {} \;; chmod +x deploy/update_app.sh; sudo ./deploy/update_app.sh"

ssh -i $PEM_FILE $USER@$SERVER_IP $SCRIPT

Write-Host "Done! Visit http://$SERVER_IP"
