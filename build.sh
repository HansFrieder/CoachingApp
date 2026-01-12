#!/usr/bin/env bash
# Exit on error
set -o errexit

# Modify this line as needed for your package manager (pip, poetry, etc.)
pip install -r requirements.txt

# Convert static asset files
python manage.py collectstatic --no-input

# Apply any outstanding database migrations
python manage.py migrate

# Get the latest JSON file with format yyyy-mm-dd.json
latest_json=$(ls -t ????-??-??.json 2>/dev/null | head -n 1)
if [ -n "$latest_json" ]; then
    python manage.py loaddata "$latest_json"
else
    echo "No fixture file found matching pattern yyyy-mm-dd.json"
fi