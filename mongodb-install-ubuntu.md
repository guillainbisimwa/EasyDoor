# MongoDB Installation Guide for Ubuntu 25

## Step 1: Update Package Index
```bash
sudo apt update
```

## Step 2: Install Required Dependencies
```bash
sudo apt install wget curl gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
```

## Step 3: Import MongoDB Public GPG Key
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
```

## Step 4: Add MongoDB Repository
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

## Step 5: Update Package Index Again
```bash
sudo apt update
```

## Step 6: Install MongoDB
```bash
sudo apt install mongodb-org
```

## Step 7: Start MongoDB Service
```bash
sudo systemctl start mongod
```

## Step 8: Enable MongoDB to Start on Boot
```bash
sudo systemctl enable mongod
```

## Step 9: Check MongoDB Status
```bash
sudo systemctl status mongod
```

## Step 10: Test MongoDB Connection
```bash
mongosh
```

## Alternative: Install via Snap (if above doesn't work)
```bash
sudo snap install mongodb
```

## Troubleshooting

### If you get permission errors:
```bash
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

### If MongoDB fails to start:
```bash
sudo systemctl restart mongod
sudo journalctl -u mongod
```

### Check if MongoDB is listening on the correct port:
```bash
sudo netstat -tlnp | grep :27017
```

### If you need to uninstall and reinstall:
```bash
sudo systemctl stop mongod
sudo apt remove mongodb-org*
sudo rm -rf /var/log/mongodb
sudo rm -rf /var/lib/mongodb
```

## MongoDB Configuration
The default config file is located at: `/etc/mongod.conf`

### To allow connections from all IPs (for development only):
```bash
sudo nano /etc/mongod.conf
```

Change:
```yaml
net:
  port: 27017
  bindIp: 127.0.0.1
```

To:
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0
```

Then restart:
```bash
sudo systemctl restart mongod
```