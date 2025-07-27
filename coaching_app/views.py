from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .config import Config
from .models import *
from .functions import create_drill, update_drill
import json

config = Config()

@login_required(login_url='login')
def mainpage(request):
    """
    Render the main page of the application.
    """
    return render(request, 'mainpage.html')

@login_required(login_url='login')
def navigation_popup(request):
    """
    Render the navigation popup for authenticated users.
    """
    return render(request, 'navigation_popup.html', context={
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

    # Alle Drills abrufen
    drills = Drill.objects.all()

    # Drills Paginattion
    paginator = Paginator(drills, 10)  # 10 drills per page
    page = request.GET.get('page', 1)
    drills = paginator.get_page(page)

    # Stat Daten als json übergeben
    stats = {drill.id: drill.stats for drill in drills}
    stats_json = json.dumps(stats)

    return render(request, 'drills.html', context={
        'drills': drills,
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

        return render(request, 'edit_drill.html', context={
            'skills': skills,
        })

@login_required(login_url='login')
def plan_training(request):
    """
    Render the plan training page.
    """
    return render(request, 'plan_training.html')

@login_required(login_url='login')
def training_report(request):   
    """
    Render the training report page.
    """
    return render(request, 'training_report.html')

@login_required(login_url='login')
def roster(request):    
    """
    Render the roster page.
    """
    return render(request, 'roster.html')

@login_required(login_url='login')
def standings(request):   
    """
    Render the standings page.
    """
    return render(request, 'standings.html')