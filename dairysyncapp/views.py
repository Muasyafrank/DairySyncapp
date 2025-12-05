from django.shortcuts import render,redirect
from dairysyncapp.models import *

# Create your views here.
def home(request):
    return render(request,'index.html')
def login(request):
    return render(request,'login.html')
def password_reset(request):
    return render(request,'password-reset.html')
def dashboard(request):
    return render(request,'dashboard.html')
def register(request):
   if request.method == 'POST':
       farmer = Farmer(
           name = request.POST['fullname'],
            email = request.POST['email'],
            phone = request.POST['phone'],
            farm = request.POST['farm']
       )
       farmer.save()
       return redirect('dashboard')
   else:
       return render(request,'register.html')


