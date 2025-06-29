from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def mainpage(request):
    """
    Render the main page of the application.
    """
    return render(request, 'mainpage.html')