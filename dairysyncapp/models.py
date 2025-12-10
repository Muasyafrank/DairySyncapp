from django.db import models
from django.utils import timezone


# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Admin'),
        ('farmer','Farmer'),
        ('vet','Veterinary')

    )
    fullname = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    farm = models.CharField(max_length=150,blank=True)
    role = models.CharField(max_length=10,choices=ROLE_CHOICES,default='farmer')

    def __str__(self):
        return f"{self.fullname} ({self.role})"
    
class Animal(models.Model):
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=20)
    gender = models.CharField(max_length=20)
    health_status = models.CharField(max_length=20, default='Unknown')

    def __str__(self):
        return self.name





    

    
    





