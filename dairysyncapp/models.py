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
    GENDER_CHOICES = [
        ('male','Male'),
        ('female','Female')
    ]

    HEALTH_STATUS_CHOICES = [
        ('healthy','Healthy'),
        ('sick','Sick'),
        ('recovering','Recovering'),
        ('unknown','Unknown')

    ]
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=20)
    gender = models.CharField(max_length=20)
    health_status = models.CharField(max_length=20,choices=HEALTH_STATUS_CHOICES,default='healthy')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    class Meta:
        ordering = ['-created_at']

        
class DailyLog(models.Model):
    ACTIVITY_CHOICES = [
        ('grazing','Grazing'),
        ('resting','Resting'),
        ('medical_treatment','Medical_treatment'),
        ('exercise','Exercise'),
        ('breeding','Breeding'),
        ('other','Other')
    ]

    HEALTH_OBSERVATIONS_CHOICES = [
        ('normal','Normal'),
        ('slight_concern','Slight Concern'),
        ('needs_attention','Needs Attention'),
        ('critical','Critical'),
    ]

    animal = models.ForeignKey(Animal,on_delete=models.CASCADE,related_name='daily_logs')
    date = models.DateField()

    # milk production

    morning_milk = models.DecimalField(max_digits=6,decimal_places=3,help_text='Litres')
    afternoon_milk = models.DecimalField(max_digits=6,decimal_places=3,help_text='Litres')
    evening_milk = models.DecimalField(max_digits=6,decimal_places=3,help_text='Litres')

    # feeding

    feed_amount = models.DecimalField(max_digits=6,decimal_places=3,help_text='Kilograms')
    water = models.DecimalField(max_digits=6,decimal_places=3,help_text='Litres')

    # health obsevations

    temperature = models.DecimalField(max_digits=6,decimal_places=3,blank=True,null=True,help_text='°C')
    health_observations = models.CharField(max_length=20,choices=HEALTH_OBSERVATIONS_CHOICES)

    # activities
    activity = models.CharField(max_length=50,choices=ACTIVITY_CHOICES)

    # notes

    notes = models.CharField(null=True,blank=True)

    # metadata

    created_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_milk(self):
        return self.morning_milk + self.afternoon_milk + self.evening_milk

    def __str__(self):
        return f"{self.animal.name} - {self.date}"

    class Meta:
        ordering = ['-date','-created_at']
        unique_together = ['animal','date'] 









    

    
    





