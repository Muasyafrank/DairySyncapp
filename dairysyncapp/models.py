from django.db import models

# Create your models here.
class Farmer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    farm = models.CharField(max_length=100)

    def __str__(self):
        return self.name


