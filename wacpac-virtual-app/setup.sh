#!/bin/bash

echo "start clean install dependencies"
npm ci
echo "compose docker container for database"
docker-compose up -d db
echo "run prisma migration script"
npx prisma db push
echo "start application"
npm run dev