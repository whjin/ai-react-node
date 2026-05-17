#!/usr/bin/env sh

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# read -p "请输入要执行的文件名：" filename

start "" "git-bash.exe" --cd="$PROJECT_ROOT/server" -c "node server.js; exec bash"

pnpm dev