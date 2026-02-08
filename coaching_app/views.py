from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.paginator import Paginator
from django.forms.models import model_to_dict
from .config import Config
from .models import *
from .functions import (
    create_drill, create_drill_list, update_drill, create_training, create_training_list, update_training, measure_context_size
)
import json

# globals
config = Config()

# Sites
@login_required(login_url='login')
def mainpage(request):
    """
    Render the main page of the application.
    """
    return render(request, 'pages/mainpage.html')

@login_required(login_url='login')
def navigation_popup(request):
    """
    Render the navigation popup for authenticated users.
    """
    return render(request, 'pages/navigation_popup.html', context={
        'hide_navbar': True,  # Hide the navbar in the popup
        'navigation_sites': config.sites['navigation_sites']
    })

@login_required(login_url='login') 
def drills(request):
    """
    Render the drills page.
    """

    # Handle new drill creation
    if request.method == 'POST':

        # Einen neuen Drill erstellen
        if request.POST.get('action') == 'create':
            create_drill({
                'name': request.POST.get('name'),
                'description': request.POST.get('description'),
                'skills': request.POST.getlist('skills'),
                'intensity': request.POST.get('intensity'),
                'difficulty': request.POST.get('difficulty')
            })

        # Einen bestehenden Drill aktualisieren
        elif request.POST.get('action') == 'update':
            update_drill({
                'drill_id': request.POST.get('drill_id'),
                'name': request.POST.get('name'),
                'description': request.POST.get('description'),
                'skills': request.POST.getlist('skills'),
                'intensity': request.POST.get('intensity'),
                'difficulty': request.POST.get('difficulty')
            })

    return render(request, 'pages/drills.html')

@login_required(login_url='login')
def training_overview(request):
    """
    Render the training page.
    """

    if request.method == 'POST':

        # Training erstellen
        if request.POST.get('submit_action') == 'create':
            create_training({
                'date': request.POST.get('date'),
                'player_count': request.POST.get('player_count'),
                'duration': request.POST.getlist('duration'),
                'actions': json.loads(request.POST.get('actions')),
                'notes': request.POST.get('notes')
            })
        
        # Training aktualisieren
        elif request.POST.get('submit_action') == 'update':
            update_training({
                'training_id': request.POST.get('training_id'),
                'date': request.POST.get('date'),
                'player_count': request.POST.get('player_count'),
                'duration': request.POST.getlist('duration'),
                'actions': json.loads(request.POST.get('actions')),
                'notes': request.POST.get('notes')
            })

        # Training abschließen (checked setzen)
        elif request.POST.get('submit_action') == 'check':
            training_id = request.POST.get('training_id')
            training = Training.objects.get(id=training_id)
            training.checked = True
            training.save()

    return render(request, 'pages/training_overview.html')

@login_required(login_url='login')
def training_report(request):   
    """
    Render the training report page.
    """

    # Trainings aus DB holen
    trainings = Training.objects.filter(checked=True).order_by('-date')

    # Zeitreihen
    time_series = {
        "labels": [training.date.strftime("%Y-%m-%d") for training in trainings],
        "skills": {
            "data": {level[1]: [] for level in config.model_choices['skill_levels'][2]},
            "colors": {
                level[1]: config.colors["skills"]["strong"].get(level[0], "#FFFFFF") 
                for level in config.model_choices['skill_levels'][2]
            }
        },
        "intensity": [training.stats["intensity"] for training in trainings],
        "difficulty": [training.stats["difficulty"] for training in trainings],
        "player_count": [training.player_count for training in trainings],
    }

    # Anteile pro Skill errechnen
    for training in trainings:
        for idx, share in enumerate(training.stats["level2_distr"]):
            time_series["skills"]["data"][config.model_choices['skill_levels'][2][idx][1]].append(share)

    

    # Kuchendiagramme

    # Daten in Json umwandeln
    context = {
        "time_series": json.dumps(time_series)
    }

    return render(request, 'pages/training_report.html', context=context)

@login_required(login_url='login')
def roster(request):    
    """
    Render the roster page.
    """
    return render(request, 'pages/roster.html')

@login_required(login_url='login')
def standings(request):   
    """
    Render the standings page.
    """
    return render(request, 'pages/standings.html')

# Edit Pages
@login_required(login_url='login') 
def edit_drill(request):
    """
    Handle update, deleting or creation of drills.
    """

    # POST wird bei Update oder Delete aufgerufen
    if request.method == 'POST':

        # Update Drill
        if request.POST.get('update'):
            drill_id = request.POST.get('update')
            drill = Drill.objects.get(id=drill_id)
            skills = Skill.objects.all()
    
            return render(request, 'pages/edit_drill.html', context={
                'skills': skills,
                'drill': drill
            })
        
        # Delete Drill
        elif request.POST.get('delete'):
            drill_id = request.POST.get('delete')
            drill = Drill.objects.get(id=drill_id)
            drill.delete()

            return redirect('drills')
    
    # GET wird bei aufgerufen, wenn man einen neuen Drill erstellen will
    if request.method == 'GET':
        skills = Skill.objects.all()

        return render(request, 'pages/edit_drill.html', context={
            'skills': skills,
        })

@login_required(login_url='login')
def plan_training(request):
    """
    Render the plan training page.
    """
    # POST wird bei Update oder Delete aufgerufen
    if request.method == 'POST':

        # Update Drill
        if request.POST.get('update'):
            training_id = request.POST.get('update')
            training = Training.objects.get(id=training_id)
            training = model_to_dict(training)

            # Namen zuweisen
            for action in training["actions"]:
                drill_id = action["drill"]
                name = Drill.objects.get(pk=drill_id).name if "custom" not in action["drill"] else action["description"]
                action["name"] = name
    
            return render(request, 'pages/plan_training.html', context={
                'training': training,
            })
        
        # Delete Drill
        elif request.POST.get('delete'):
            training_id = request.POST.get('delete')
            training = Training.objects.get(id=training_id)
            training_id.delete()

            return redirect('training_overview')
    
    # GET wird bei aufgerufen, wenn man einen neuen Drill erstellen will
    if request.method == 'GET':
        drills = Drill.objects.all()

        return render(request, 'pages/plan_training.html', context={
            'drills': drills,
        })

# APIs
@login_required(login_url='login')
def api_drills(request):
    """
    API endpoint to get drill context based on filters.
    """

    context = {}

    # Filter aufnehmen
    filter_dict = {
        'search': request.GET.get('search', None),
        'skills': request.GET.get('skills', None),  # TODO: Gegebenenfalls Umgang mit keiner Skill-Auswahl
        'level1': request.GET.get('level1', None),
        'level2': request.GET.get('level2', None),
        'page': request.GET.get('page', 1)
    }
    print(filter_dict)

    # Drill Context holen
    drill_list_context = create_drill_list(filter_dict)
    context.update(drill_list_context)

    # Größe messen und senden, falls unter Schwellwert von 20KB
    size = measure_context_size(context)
    if size < 20:
        return JsonResponse(
            context,
            json_dumps_params={'ensure_ascii': False, 'separators': (',', ':')}
        )
    else:
        print("Context zu groß, sende Fehlermeldung.")
        return JsonResponse({'error': 'Context size exceeds limit.'}, status=413)

@login_required(login_url='login')
def api_drill_details(request, drill_id):
    """
    API endpoint to get drill context based on drill ID.
    """

    # Drill Laden
    drill = Drill.objects.get(id=drill_id)

    # Context erstellen
    context = {
        "meta": config.model_choices,
        "drill": serializers.serialize("json", [drill])
    }

    # Größe messen und senden, falls unter Schwellwert von 20KB
    size = measure_context_size(context)
    if size < 20:
        return JsonResponse(
            context,
            json_dumps_params={'ensure_ascii': False, 'separators': (',', ':')}
        )
    else:
        print("Context zu groß, sende Fehlermeldung.")
        return JsonResponse({'error': 'Context size exceeds limit.'}, status=413)

@login_required(login_url='login')
def api_training(request):
    """
    API endpoint to get training context based on filters.
    """
    context = {}

    # Filter aufnehmen
    filter_dict = {
        'search': request.GET.get('search', None),
        # 'date_to': request.GET.get('date_to', None),
        'page': request.GET.get('page', 1)
    }

    # Training Context holen
    training_list_context = create_training_list(filter_dict)
    context.update(training_list_context)

    return JsonResponse(context)