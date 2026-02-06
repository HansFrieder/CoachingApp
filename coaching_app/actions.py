from .models import *

# python manage.py shell -c "from coaching_app.actions import save_all_instances; save_all_instances()"
def save_all_instances():
    """
    Save all instances of a given model to trigger any save-related logic (e.g., recalculating stats).
    """
    for model in [Drill, Training]:
        instances = model.objects.all()
        for instance in instances:
            instance.save()