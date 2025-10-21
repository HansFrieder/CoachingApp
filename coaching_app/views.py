from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .config import Config
from .models import *
from .functions import create_drill, update_drill, create_list_view
import json

config = Config()

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
def drills_new(request):
    """
    VERSUCH
    """

    # Extra Content für Custom Style
    stats = {drill.id: drill.stats for drill in drills}
    stats_json = json.dumps(stats)

    context = create_list_view(
        Drill,
        request,
        search='name',
        filter=['skills', 'level2_main'],
        buttons=['update', 'delete'],
        on_click='popup',
        custom_canvases=3,
        custom_style_props=stats_json
    )

    return render(request, 'pages/drills_new.html', context=context)

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

    # Filter aufnehmen
    filter_dict = {
        'search': request.GET.get('search', None),
        'skill': request.GET.get('skill', None) # TODO: Gegebenenfalls Umgang mit keiner Skill-Auswahl 
    }

    # Daten abrufen
    drills = Drill.objects.all()
    drills = drills.order_by('name')  # Sortieren nach Name
    skills = Skill.objects.all()

    # Filter anwenden
    if filter_dict['search']:
        drills = drills.filter(name__icontains=filter_dict['search'])
    if filter_dict['skill']:
        drills = drills.filter(skills__name__icontains=filter_dict['skill'])

    # Drills Paginattion
    paginator = Paginator(drills, 10)  # 10 drills per page
    page = request.GET.get('page', 1)
    drills_page = paginator.get_page(page)

    # Stat Daten als json übergeben
    stats = {drill.id: drill.stats for drill in drills}
    stats_json = json.dumps(stats)

    return render(request, 'pages/drills.html', context={
        'drills': drills_page,
        'skills': skills,
        'stats': stats_json
    })

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
    
            return render(request, 'edit_drill.html', context={
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
    return render(request, 'pages/plan_training.html')

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