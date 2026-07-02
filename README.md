## AI 智能助手

**服务端**：

- 基于 Node.js 构建
- 提供 API 接口
- 处理 AI 模型的调用
- Skill 技能管理
- 会话历史记录
- AI模型管理

**客户端**：

- 基于 React 构建
- 提供用户界面
- 与服务端 API 交互

## 一键启动服务

```bash
#!/usr/bin/env sh

start "" "git-bash.exe" -c "pnpm node; exec bash"

pnpm dev
```

## 一键提交脚本

```sh
#!/usr/bin/env sh

# commin信息格式：时间戳 + 提交信息

COMMIT_FILE="Commit.md"
DEFAULT_MESSAGE="提交更新"
TMP_COMMIT=$(mktemp -t commit.XXXXXX 2>/dev/null || mktemp)
TIME_THRESHOLD=600  # 10分钟的秒数

# 1. 检查文件是否存在，不存在则创建
if [ ! -f "$COMMIT_FILE" ]; then
    touch "$COMMIT_FILE"
fi

# 2. 提取最新提交行的时间戳和消息内容
# 过滤空行 → 取第一行 → 拆分时间戳和消息体
latest_commit_line=$(sed '/^[[:space:]]*$/d' "$COMMIT_FILE" | head -n 1)

# 提取时间戳字符串（匹配 "YYYY-MM-DD HH:MM:SS" 格式开头）
commit_timestamp_str=$(echo "$latest_commit_line" | sed -E 's/^([0-9-]+ [0-9:.]+).*$/\1/')

# 提取剔除时间戳后的提交消息（去首尾空白）
latest_commit=$(echo "$latest_commit_line" | sed -E "s/^$commit_timestamp_str//i" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

# 3. 时间戳比对：判断与当前时间差是否超过TIME_THRESHOLD
if [ -n "$commit_timestamp_str" ]; then
    # 将提交时间戳转为Unix时间戳（秒），忽略转换失败的情况
    commit_timestamp=$(date -d "$commit_timestamp_str" +%s 2>/dev/null)
    if [ -n "$commit_timestamp" ]; then
        current_timestamp=$(date +%s)  # 当前时间戳
        time_diff=$(( current_timestamp - commit_timestamp ))
        time_diff=${time_diff#-}  # 取绝对值（避免负数差值）

        # 超过TIME_THRESHOLD则清空消息，后续会使用默认值
        if [ $time_diff -gt $TIME_THRESHOLD ]; then
            latest_commit=""
        fi
    fi
fi

echo "正在提交代码..."
git pull
git add .

# 4. 判断内容是否为空，若为空则使用默认提交信息
if [ -n "$latest_commit" ]; then
    git commit -m "$latest_commit"
else
    git commit -m "$DEFAULT_MESSAGE"
fi

git push

echo "按任意键关闭"
read -n 1

# 5. 提交成功后删除临时文件
rm -f "$TMP_COMMIT"

exit 0
```

## 环境变量配置

`server/.env.md` 文件名改为 `server/.env`

## 调试

**当前已经调通的模型**

1. 智谱 `zhipu`
   - `model：glm-4-flash`
   - `base_url：https://open.bigmodel.cn/api/paas/v4`
2. 通义千问 `tongyi`
   - `model：qwen3.7-plus`
   - `base_url：https://ws-8rtd9w1qqbcprba0.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`
3. 月之暗面 `kimi`
   - `model：moonshot-v1-128k`
   - `base_url：https://api.moonshot.cn/v1`

**迭代功能：接入网络搜索、 `Agent` 智能体和集成外部 `Skill` 功能**
