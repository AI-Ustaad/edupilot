#!/bin/bash

echo ""
echo "=========================================="
echo " EduPilot Enterprise Release Pipeline"
echo "=========================================="
echo ""

echo "Checking Git Status..."
git status

echo ""
echo "Installing packages..."
npm install

if [ $? -ne 0 ]; then
    echo "npm install failed"
    exit 1
fi

echo ""
echo "Running Production Build..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ BUILD FAILED"
    exit 1
fi

echo ""
echo "Build Successful"

echo ""
echo "Adding Files..."
git add .

echo ""
echo "Committing..."

git commit -m "$1"

echo ""
echo "Pushing GitHub..."

git push origin main

if [ $? -ne 0 ]; then
    echo "Git Push Failed"
    exit 1
fi

echo ""
echo "Deploying Production..."

vercel --prod

echo ""
echo "=========================================="
echo " RELEASE SUCCESSFUL"
echo "=========================================="
