#!/usr/bin/env zsh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

pause() {
  echo ""
  echo -e "${YELLOW}$1${RESET}"
  echo -e "Press any key to continue, or Ctrl+C to abort..."
  read -rsk 1
  echo ""
}

echo -e "${GREEN}=== Corpus Release Script ===${RESET}"

# 1. Clean dist and node_modules from all packages (with backup)
echo -e "${RED}Step 1: Backing up and deleting dist and node_modules...${RESET}"
BACKUP_DIR=".release-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "  Backup folder: $BACKUP_DIR"

backup_and_remove() {
  local src="$1"
  local label="$2"
  if [[ -d "$src" ]]; then
    local dest="$BACKUP_DIR/$label"
    echo "  Backing up $src -> $dest"
    mv "$src" "$dest"
  fi
}

# Root node_modules
backup_and_remove "node_modules" "root__node_modules"

# Package node_modules and dist
for dir in packages/*/; do
  local_name="${dir%/}"         # strip trailing slash
  local_name="${local_name##*/}" # strip leading path
  backup_and_remove "$dir/dist" "${local_name}__dist"
  backup_and_remove "$dir/node_modules" "${local_name}__node_modules"
done

echo "Done. To rollback, run: mv $BACKUP_DIR/*__dist packages/<name>/dist etc., or restore manually from $BACKUP_DIR/"
pause "Step 1 complete. Ready to install dependencies?"

# 2. Install dependencies
echo -e "${GREEN}Step 2: Running pnpm i...${RESET}"
pnpm i
pause "Step 2 complete. Ready to format?"

# 3. Format
echo -e "${GREEN}Step 3: Running pnpm run fm...${RESET}"
pnpm run fm
pause "Step 3 complete. Ready to lint?"

# 4. Lint
echo -e "${GREEN}Step 4: Running pnpm run lint...${RESET}"
pnpm run lint
pause "Step 4 complete. Ready to build?"

# 5. Build all packages
echo -e "${GREEN}Step 5: Running pnpm -r run build...${RESET}"
pnpm -r run build
pause "Step 5 complete. Ready to run tests?"

# 6. Test all packages
echo -e "${GREEN}Step 6: Running pnpm -r test:all...${RESET}"
pnpm -r --reporter=append-only test:all
pause "Step 6 complete. Ready to create a changeset?"

# 7. Changeset (interactive — waits for CLI to finish naturally)
echo -e "${GREEN}Step 7: Running pnpm run changeset...${RESET}"
pnpm run changeset
pause "Step 7 complete. Ready to version packages?"

# 8. Version
echo -e "${GREEN}Step 8: Running pnpm run version...${RESET}"
pnpm run version
pause "Step 8 complete. Ready to publish?"

# 9. Release
echo -e "${GREEN}Step 9: Running pnpm run release...${RESET}"
pnpm run release

echo ""
echo -e "${GREEN}=== Release complete! ===${RESET}"
