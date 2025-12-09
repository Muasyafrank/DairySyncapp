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
    path('',views.home),
    path('login/',views.login,name='login'),
    path('register/',views.register,name='register'),
    path('password_reset/',views.password_reset,name='password_reset'),    
    path('animal_registration/',views.animal_registration_page,name='animal-registration'),
    path('animal_listing/',views.animal_listing_page,name='animal-listing'),


    # Api
    # path('animals/',views.api_get_animals,name='api_get_animals'),
    # path('animals/create/',views.api_create_animal,name='api_create_animal'),
    # path('statistics/',views.api_get_statistics,name='api_get_statistics'),
    # path('milk_logs/create/',views.api_create_milk_log,name='api_create_milk_log'),
    # path('milk_logs/bulk/',views.api_bulk_milk_entry,name='api_bulk_milk_entry'),
    





    

    
   
]
