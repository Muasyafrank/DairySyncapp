from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.db import models


# Create your models here.
class Profile(models.Model):
    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('vet', 'Veterinarian'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20)
    farm_name = models.CharField(max_length=200)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='farmer')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.farm_name}"
    
    class Meta:
        ordering = ['-created_at']
   
    
class Animal(models.Model):
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=20)
    gender = models.CharField(max_length=20)
    health_status = models.CharField(max_length=20, default='Unknown')

    def __str__(self):
        return self.name





    

    
    





