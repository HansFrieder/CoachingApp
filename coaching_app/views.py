from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .config import Config
from .models import *

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
        # TODO: Check einbauen, ob alle Felder ausgefüllt sind und sonst Fehlermeldung zurückgeben
        
        new_drill = {
            'name': request.POST.get('name'),
            'description': request.POST.get('description'),
            'skills': request.POST.getlist('skills'),
            'intensity': request.POST.get('intensity'),
            'difficulty': request.POST.get('difficulty')
        }

        drill = Drill.objects.create(
            name=new_drill['name'],
            description=new_drill['description'],
            intensity=new_drill['intensity'],
            difficulty=new_drill['difficulty']
        )

        # Setze die ManyToMany-Beziehung (nach dem Erstellen)
        if new_drill['skills']:
            drill.skills.set(new_drill['skills'])  # erwartet Liste von IDs
        
        drill.save()

    drills = Drill.objects.all()

    return render(request, 'drills.html', context={
        'drills': drills
    })

@login_required(login_url='login') 
def create_drill(request):
    """
    Render the create drill page.
    """

    skills = Skill.objects.all()
    skill_colors = config.colors['skills']

    return render(request, 'create_drill.html', context={
        'skills': skills,
        'skill_colors': skill_colors
    })

@login_required(login_url='login')
def delete_drill(request, drill_id):
    """
    Delete a drill.
    """
    
    drill = Drill.objects.get(id=drill_id)
    drill.delete()

    return redirect('drills')

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