from django.db import models
from django.utils import timezone


# Create your models here.
class Farmer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    farm = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Animal(models.Model):
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=20)
    gender = models.CharField(max_length=20)
    health_status = models.CharField(max_length=20)

    def __str__(self):
        return self.name





    

    
    





