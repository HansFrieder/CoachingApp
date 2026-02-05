#!/bin/bash
set -e  # Script bricht bei Fehler sofort ab
echo "==== Starting build for CoachingApp ===="

# Aktivieren venv
echo "Activating virtual environment..."
source ./venv/bin/activate

# Abhängigkeiten installieren
echo "Installing requirements..."
pip install --upgrade pip
pip install -r requirements.txt

# Staticfiles sammeln
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Datenbank migrieren
echo "Running migrations..."
python manage.py migrate

# Gunicorn systemd Service neu starten
echo "Restarting Gunicorn service..."
sudo systemctl daemon-reload
sudo systemctl restart coachingapp
sudo systemctl status coachingapp --no-pager

echo "==== Build complete! App should be live. ===="