#!/usr/bin/env sh

git add .
read -p "请输入客户端提交信息: " message1
git commit -m "$message1"
git push

cd server
git checkout gh-pages
git add .
read -p "请输入服务端提交信息: " message2
git commit -m "$message2"
git push origin gh-pages

echo "按任意键关闭"
read -n 1

exit 0
