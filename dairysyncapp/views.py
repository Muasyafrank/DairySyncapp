from django.shortcuts import render, redirect
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import Profile, Animal
import re

# Home Page
def home(request):
    return render(request, 'index.html')

def login_page(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email', '').strip().lower()
            password = request.POST.get('password', '')
            
    
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
                
                # Authenticate user
                user = authenticate(request, username=username, password=password)
                
                if user is not None:
                    auth_login(request, user)
                    messages.success(request, f'Welcome back, {user.first_name}!')
                    
                    # Redirect to next page or dashboard
                    next_url = request.GET.get('next', 'animal-listing')
                    return redirect(next_url)
                else:
                    messages.error(request, 'Invalid email or password.')
            except User.DoesNotExist:
                messages.error(request, 'Invalid email or password.')
            
            return render(request, 'login.html', {'form_data': request.POST})
            
        except Exception as e:
            messages.error(request, f'Login error: {str(e)}')
            return render(request, 'login.html', {'form_data': request.POST})
    else:
        return render(request, 'login.html')

# User Registration
def register(request):
    if request.method == 'POST':
        try:
            # Get form data
            fullname = request.POST.get('fullname', '').strip()
            email = request.POST.get('email', '').strip().lower()
            phone = request.POST.get('phone', '').strip()
            farm = request.POST.get('farm', '').strip()
            role = request.POST.get('role', '').strip()
            password1 = request.POST.get('password1', '')
            password2 = request.POST.get('password2', '')
            terms = request.POST.get('terms')
            
            # Validation
            errors = []
            
            # Check if all fields are filled
            if not all([fullname, email, phone, farm, role, password1, password2]):
                errors.append('All fields are required.')
            
            # Validate email format
            if email:
                try:
                    validate_email(email)
                except ValidationError:
                    errors.append('Please enter a valid email address.')
            
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                errors.append('This email is already registered.')
            
            # Validate phone number (basic validation)
            phone_pattern = re.compile(r'^\+?1?\d{9,15}$')
            clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
            if not phone_pattern.match(clean_phone):
                errors.append('Please enter a valid phone number.')
            
            # Validate role
            if role not in ['farmer', 'vet']:
                errors.append('Please select a valid account type.')
            
            # Password validation
            if len(password1) < 8:
                errors.append('Password must be at least 8 characters long.')
            
            if password1 != password2:
                errors.append('Passwords do not match.')
            
            # Check password strength
            if not re.search(r'[A-Z]', password1):
                errors.append('Password must contain at least one uppercase letter.')
            if not re.search(r'[a-z]', password1):
                errors.append('Password must contain at least one lowercase letter.')
            if not re.search(r'\d', password1):
                errors.append('Password must contain at least one number.')
            
            # Check terms acceptance
            if not terms:
                errors.append('You must accept the Terms of Service and Privacy Policy.')
            
            # If there are errors, display them and return
            if errors:
                for error in errors:
                    messages.error(request, error)
                return render(request, 'register.html', {'form_data': request.POST})
            
            # Split fullname into first and last name
            name_parts = fullname.split(maxsplit=1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            # Create username from email (before @)
            username = email.split('@')[0]
            
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create user profile with additional info
            Profile.objects.create(
                user=user,
                phone=phone,
                farm_name=farm,
                role=role
            )
            
            # Log the user in automatically
            auth_login(request, user)
            
            messages.success(request, f'Welcome to DairySync, {first_name}! Your account has been created successfully.')
            return redirect('login')
            
        except Exception as e:
            messages.error(request, f'Error creating account: {str(e)}')
            return render(request, 'register.html', {'form_data': request.POST})
    else:
        return render(request, 'register.html')

# Logout View
def logout_view(request):
    auth_logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('login')

# Password Reset
def password_reset(request):
    return render(request, 'password-reset.html')

# Dashboard


# Animal Listing Page
def animal_listing_page(request):
    animals = Animal.objects.all()
    return render(request, 'listing.html', {'animals': animals})    

# Animal Registration Page
def animal_registration_page(request):
    if request.method == 'POST':
        try:
            # Create Animal instance with correct field mapping
            animal = Animal(
                name=request.POST.get('name'),
                species=request.POST.get('species'),
                breed=request.POST.get('breed'),
                gender=request.POST.get('gender'),
                health_status=request.POST.get('health_status'),
            )
            animal.save()
            messages.success(request, 'Animal has been successfully registered')
            return redirect('animal-listing')
        except Exception as e:
            messages.error(request, f'Error saving animal: {str(e)}')
            return render(request, 'registration.html', {'form_data': request.POST})
    else:
        return render(request, 'registration.html')
    



def animal_detail(request, animal_id):
    try:
        animal = Animal.objects.get(id=animal_id)
        return render(request, 'animal_detail.html', {'animal': animal})
    except Animal.DoesNotExist:
        messages.error(request, 'Animal not found.')
        return redirect('animal-listing')

# Delete Animal
def animal_delete(request, animal_id):
    if request.method == 'POST':
        try:
            animal = Animal.objects.get(id=animal_id)
            animal_name = animal.name
            animal.delete()
            messages.success(request, f'{animal_name} has been successfully deleted.')
            return redirect('animal-listing')
        except Animal.DoesNotExist:
            messages.error(request, 'Animal not found.')
            return redirect('animal-listing')
        except Exception as e:
            messages.error(request, f'Error deleting animal: {str(e)}')
            return redirect('animal-listing')
    else:
        return redirect('animal-listing')   