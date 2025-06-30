from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .config import *

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
        'navigation_sites': config_dict['navigation_sites']
    })

@login_required(login_url='login') 
def drills(request):
    """
    Render the drills page.
    """
    return render(request, 'drills.html')

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