from django.shortcuts import render

def mainpage(request):
    """
    Render the main page of the application.
    """
    return render(request, 'mainpage.html')