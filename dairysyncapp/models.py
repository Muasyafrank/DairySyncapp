from django.db import models
from django.utils import timezone
import random
import string

# Create your models here.
class Farmer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    farm = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Animal(models.Model):
    SPECIES_cHOICES = [
        ('Cow','Cow'),
        ('Goat','Goat'),
        ('Sheep','Sheep'),
    ]
    HEALTH_STATUS_CHOICES = [
        ('healthy','Healthy'),
        ('observation','Under Observation'),
        ('sick','Sick'),
        ('recovering','Recovering')
    ]
    GENDER_CHOICES = [
        ('female','Female'),
        ('male','Male')
    ]
    SOURCE_CHOICES = [
        ('born_on_farm','Born on Farm'),
        ('purchased','Purchased'),
        ('gift','Gift/Donation'),
        ('other','Other')
    ]
    STATUS_CHOICES = [
        ('active','Active'),
        ('sold','Sold'),
        ('deceased','Deceased'),
        ('inactive','Inactive'),
        ('transferred','Transferred')
    ]

    # Basic information

    animal_id = models.CharField(max_length=50, unique=True,verbose_name="Animal ID")
    name = models.CharField(max_length=100,blank=True,null=True,verbose_name="Animal Name")
    ear_tag = models.CharField(max_length=50,blank=True,null=True,verbose_name="Ear Tag Number")
    species = models.CharField(max_length=20,choices=SPECIES_CHOICES,verbose_name="Species")
    breed = models.CharField(max_length=100,blank=True,verbose_name="Breed")
    gender = models.CharField(max_length=10,choices=GENDER_CHOICES,verbose_name="Gender")
    dob = models.DateField(verbose_name="Date of Birth")
    age_years = models.IntegerField(default=0,verbose_name="Age (Years)")
    age_months = models.IntegerField(default=0,verbose_name="Age (Months)")
    photo = models.ImageField(upload_to='animal-photos/',blank=True,null=True,verbose_name="Animal Photo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Physical Details
    color = models.CharField(max_length=100,verbose_name="Color")
    weight = models.DecimalField(max_digits=5,decimal_places=2,blank=True,null=True,verbose_name="Weight (kg)")
    height = models.DecimalField(max_digits=5,decimal_places=2,blank=True,null=True,verbose_name="Height (cm)")
    body_length = models.DecimalField(max_digits=5,decimal_places=2,blank=True,null=True,verbose_name="Body Length (cm)")
    chest_girth = models.DecimalField(max_digits=5,decimal_places=2,blank=True,null=True,verbose_name="Chest Girth (cm)")
    body_condition_score = models.CharField(max_length=1,choices=[
        ('1','1 -Very Thin'),
        ('2','2 - Thin'),
        ('3','3 - Ideal'),
        ('4','4 - Overweight'),
        ('5','5 - Obese'),
    ],default='3',verbose_name="Body Condition Score (1-5)")
    identification_marks = models.TextField(blank=True,verbose_name="Identification Marks",null=True)
    physical_notes = models.TextField(blank=True,verbose_name="Physical Notes",null=True)

    # Origin and Status
    acquisition_date = models.DateField(verbose_name="Acquisition Date")
    source = models.CharField(max_length=20,choices=SOURCE_CHOICES,verbose_name="Source")
    purchase_price = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True,verbose_name="Purchase Price")
    seller = models.CharField(max_length=100,blank=True,null=True,verbose_name="Seller Information")
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='active',verbose_name="Current Status")
    health_status = models.CharField(max_length=20,choices=HEALTH_STATUS_CHOICES,default='healthy',verbose_name="Health Status")
    health_notes = models.TextField(blank=True,verbose_name="Health Notes",null=True)
    group = models.CharField(max_length=100,blank=True,verbose_name="Group/ Pen Assignment",null=True)
    location = models.CharField(max_length=100,blank=True,verbose_name="Location/Pen Number",null=True)
    initial_notes = models.TextField(blank=True,verbose_name="Initial Notes",null=True)


class Meta:
        ordering = ['-created_at']

        def __str__(self):
            return f"{self.animal_id} - {self.name or 'Unnamed'}"
        
        def save(self, *args, **kwargs):
            #  Auto-generate animal_id if not provided
            if not self.animal_id:
                 self.animal_id = self.generate_animal_id()

            # age calculation
            if self.dob:
                 today = timezone.now().date()
                 delta = today - self.dob
                 self.age_years = delta.days // 365
                 self.age_months = (delta.days % 365) // 30

            super().save(*args, **kwargs)
                   




    

    
    





