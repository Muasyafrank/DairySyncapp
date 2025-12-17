"""
URL configuration for DairySync project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
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
from django.urls import path
from dairysyncapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('login/', views.login_page, name='login'),  # Changed to login_page
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='logout'),  # Added logout
    path('password_reset/', views.password_reset, name='password_reset'), 
    path('animal_registration/', views.animal_registration_page, name='animal-registration'),
    path('animal_listing/', views.animal_listing_page, name='animal-listing'),
    path('animal/<int:animal_id>/', views.animal_detail, name='animal-detail'),  # View animal details
    path('animal/<int:animal_id>/delete/', views.animal_delete, name='animal-delete'),  # Delete animal
    path('add_daily_log/<int:animal_id>/',views.add_daily_log,name='add-daily-log'),
    path('edit_daily_log/<int:log_id>/',views.edit_daily_log,name='edit-daily-log'),
    path('animal-detail/',views.animal_detail,name='animal_detail'),
    path('manage-logs', views.manage_logs, name='manage-logs'),
    path('delete-daily-log/<int:log_id>/', views.delete_daily_log, name='delete-daily-log'),
    path('logs/bulk-delete/', views.bulk_delete_logs, name='bulk-delete-logs'),
     path('vet-dashboard/', views.vet_dashboard, name='vet-dashboard'),
]   