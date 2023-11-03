#!/bin/sh
tail -f /app/storage/logs/logger.log &
exec "$@"
