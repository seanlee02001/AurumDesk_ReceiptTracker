# Push to GitHub - Authentication Required

## Option 1: Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "AurumDesk Receipt Tracker"
   - Select scope: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Push using the token:**
   ```bash
   git push https://YOUR_TOKEN@github.com/seanlee02001/AurumDesk_ReceiptTracker.git main
   ```
   
   Or update the remote URL:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/seanlee02001/AurumDesk_ReceiptTracker.git
   git push -u origin main
   ```

## Option 2: SSH (If you have SSH keys set up)

1. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:seanlee02001/AurumDesk_ReceiptTracker.git
   ```

2. **Push:**
   ```bash
   git push -u origin main
   ```

## Option 3: GitHub CLI

1. **Install GitHub CLI** (if not installed):
   ```bash
   brew install gh
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```

3. **Push:**
   ```bash
   git push -u origin main
   ```

## Quick Command (After getting token):

Replace `YOUR_TOKEN` with your actual token:

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/seanlee02001/AurumDesk_ReceiptTracker.git
git push -u origin main
```

