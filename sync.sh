#!/bin/bash

echo "=========================================="
echo " EduPilot Git Sync"
echo "=========================================="

git fetch origin

if [ $? -ne 0 ]; then
    echo "Git Fetch Failed"
    exit 1
fi

git pull origin main --rebase

if [ $? -ne 0 ]; then
    echo "Git Pull Failed"
    exit 1
fi

echo ""
echo "Repository Synced Successfully"
