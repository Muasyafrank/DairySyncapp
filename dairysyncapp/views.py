# animals/views.py
from django.shortcuts import render, redirect, get_object_or_404
from dairysyncapp.models import*
from django.contrib import messages

def home(request):
    return render(request,'index.html')
def login(request):
    return render(request,'login.html')

def register(request):
    return render(request,'register.html')

def password_reset(request):
    return render(request,'password-reset.html')
def dashboard(request):
    return render(request,'dashboard.html')

# Registration Page
def animal_listing_page(request):
    animals = Animal.objects.all()
    return render(request,'listing.html',{'animals':animals})    

# Listing Page
def animal_registration_page(request):
    if request.method == 'POST':
        try:
            # Create Animal instance with correct field mapping
            animal = Animal(
                name=request.POST.get('name'),
                species=request.POST.get('species'),
                breed=request.POST.get('breed'),
                gender=request.POST.get('gender'),
                health_status=request.POST.get('health_status'),  # Map form 'health' to model 'health_status'
            )
            animal.save()
            messages.success(request, 'Animal has been successfully registered')
            return redirect('animal-listing')  # Make sure this matches your URL name
        except Exception as e:
            messages.error(request, f'Error saving animal: {str(e)}')
            # Return to form with errors
            return render(request, 'registration.html', {'form_data': request.POST})
    else:
        return render(request, 'registration.html')




    





   