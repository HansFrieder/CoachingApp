"""
URL configuration for coaching_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path
from django.utils.module_loading import import_string

from . import views
from .config import Config

config = Config()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.mainpage, name="mainpage"),  # Mainpage
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'), # Login
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'), # Logout
    path('navigation/', views.navigation_popup, name='navigation_popup'),  # Navigation Popup
    *[path(f"{site["url"]}/", import_string(site["view"]), name=site["url"]) for site in config.sites['navigation_sites']], # Dynamic URL patterns for navigation sites
    path('drills/edit/', views.edit_drill, name='edit_drill'),  # Edit or delete Drill
]
