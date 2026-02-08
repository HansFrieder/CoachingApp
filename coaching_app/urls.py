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
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from django.utils.module_loading import import_string

from . import views
from .config import Config

config = Config()

urlpatterns = [

    # Admin and Authentication
    path('admin/', admin.site.urls),
    path('', views.mainpage, name="mainpage"),  # Mainpage
    path('login/', auth_views.LoginView.as_view(template_name='pages/login.html'), name='login'), # Login
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'), # Logout
    
    # Navigation
    path('navigation/', views.navigation_popup, name='navigation_popup'),  # Navigation Popup
    
    # Sites
    *[path(f"{site['url']}/", import_string(site["view"]), name=site["url"]) for site in config.sites['navigation_sites']], # Dynamic URL patterns for navigation sites
    
    # Edit Pages
    path('drills/edit/', views.edit_drill, name='edit_drill'),  # Edit or delete Drill
    path('training/plan/', views.plan_training, name='plan_training'),  # Plan or edit Training
    
    # API Endpoints
    path('api/drills/', views.api_drills, name='api_drills'),  # API for Drill Context
    path('api/drills/<int:drill_id>/', views.api_drill_details, name='api_drill_details'),  # API for Drill Details
    path('api/training/', views.api_training, name='api_training'),  # API for Training Context
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
