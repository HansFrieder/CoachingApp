from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .config import Config
from .models import *
from .functions import create_drill, create_drill_list, update_drill, create_training
import json

# globals
config = Config()

# Render Views
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
    context = {}

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

    # Filter aufnehmen
    filter_dict = {
        'search': request.GET.get('search', None),
        'skills': request.GET.get('skills', None),  # TODO: Gegebenenfalls Umgang mit keiner Skill-Auswahl
        # 'page': request.GET.get('page', 1)
    }

    # Drill Context holen
    drill_list_context = create_drill_list(filter_dict)
    context.update(drill_list_context)

    return render(request, 'pages/drills.html', context=context)

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
def training_overview(request):
    """
    Render the training page.
    """
    context = {}

    if request.method == 'POST':

        # Training erstellen
        if request.POST.get('submit_action') == 'create':
            create_training({
                'date': request.POST.get('date'),
                'player_count': request.POST.get('player_count'),
                'duration': request.POST.getlist('duration'),
                'actions': json.loads(request.POST.get('actions'))
            })

    return render(request, 'pages/training_overview.html')

@login_required(login_url='login')
def plan_training(request):
    """
    Render the plan training page.
    """
    context = {}

    # Filter aufnehmen
    filter_dict = {
        'search': request.GET.get('search', None),
        'skills': request.GET.get('skills', None),  # TODO: Gegebenenfalls Umgang mit keiner Skill-Auswahl
        'page': request.GET.get('page', 1)
    }

    # Drill Context holen
    drill_list_context = create_drill_list(filter_dict)
    context.update(drill_list_context)

    return render(request, 'pages/plan_training.html', context=context)

@login_required(login_url='login')
def training_report(request):   
    """
    Render the training report page.
    """
    return render(request, 'pages/training_report.html')

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
        # 'page': request.GET.get('page', 1)
    }

    # Drill Context holen
    drill_list_context = create_drill_list(filter_dict)
    context.update(drill_list_context)

    return JsonResponse(context)