#!/bin/sh

# รอให้ database พร้อมใช้งาน
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
npm start 