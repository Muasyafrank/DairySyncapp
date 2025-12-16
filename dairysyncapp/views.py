from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models import Sum ,Count,Avg,Q
from datetime import datetime,timedelta
from .models import *
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
def add_daily_log(request, animal_id):
    animal = get_object_or_404(Animal, id=animal_id)

    if request.method == "POST":
        try:
            # Get form data with proper defaults
            date = request.POST.get('date')
            morning_milk = request.POST.get('morning_milk') or 0
            afternoon_milk = request.POST.get('afternoon_milk') or 0
            evening_milk = request.POST.get('evening_milk') or 0
            feed_amount = request.POST.get('feed_amount') or 0
            water = request.POST.get('water_consumption') or 0
            temperature = request.POST.get('temperature') or None
            health_observations = request.POST.get('health_observation', 'normal')
            activity = request.POST.get('activity', 'grazing')
            notes = request.POST.get('notes', '')
            
            # Check if log already exists for this date
            existing_log = DailyLog.objects.filter(animal=animal, date=date).first()
            
            if existing_log:
                messages.error(request, f'A log entry already exists for {date}. Please edit that entry instead.')
                return redirect('animal-detail', animal_id=animal_id)
            
            # Create daily log
            DailyLog.objects.create(
                animal=animal,
                date=date,
                
                # Milk production
                morning_milk=morning_milk,
                afternoon_milk=afternoon_milk,
                evening_milk=evening_milk,
                
                # Feeding (note: field is water_consumption, not water)
                feed_amount=feed_amount,
                water=water,
                
                # Health (note: field is health_observation, not health_observations)
                temperature=temperature if temperature else None,
                health_observations=health_observations,
                
                # Activity
                activity=activity,
                
                # Notes
                notes=notes,
                
                # Who created it
                created_by=request.user if request.user.is_authenticated else None
            )
            
            messages.success(request, f'Daily log for {animal.name} on {date} has been added successfully.')
            return redirect('manage-logs')
            
        except Exception as e:
            messages.error(request, f'Error adding daily log: {str(e)}')
            return redirect('animal-detail', animal_id=animal_id)

    return render(request, 'add_daily_log.html', {'animal': animal})



def edit_daily_log(request, log_id):
    """
    Edit an existing daily log entry
    """
    # Get the daily log or return 404 if not found
    daily_log = get_object_or_404(DailyLog, id=log_id)
    animal = daily_log.animal

    if request.method == 'POST':
        try:
            # Update milk production
            daily_log.morning_milk = request.POST.get('morning_milk') or 0
            daily_log.afternoon_milk = request.POST.get('afternoon_milk') or 0
            daily_log.evening_milk = request.POST.get('evening_milk') or 0
            
            # Update feeding
            daily_log.feed_amount = request.POST.get('feed_amount') or 0
            daily_log.water = request.POST.get('water_consumption') or 0
            
            # Update health
            temperature = request.POST.get('temperature')
            daily_log.temperature = temperature if temperature else None
            daily_log.health_observations = request.POST.get('health_observation', 'normal')
            
            # Update activity
            daily_log.activity = request.POST.get('activity', 'grazing')
            
            # Update notes
            daily_log.notes = request.POST.get('notes', '')
            
            # Save the changes
            daily_log.save()
            
            messages.success(request, 'Daily log has been updated successfully.')
            return redirect('animal-detail', animal_id=animal.id)
            
        except Exception as e:
            messages.error(request, f'Error updating daily log: {str(e)}')
            return redirect('animal-detail', animal_id=animal.id)
    
    # GET request - show the form with existing data
    return render(request, 'edit_daily_log.html', {
        'animal': animal,
        'daily_log': daily_log
    })



@login_required
def manage_logs(request):
    logs = DailyLog.objects.select_related('animal').order_by('-date')

    animal_filter = request.GET.get('animal', '')
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    health_filter = request.GET.get('health', '')

    if animal_filter:
        logs = logs.filter(animal_id=animal_filter)

    if date_from:
        logs = logs.filter(date__gte=date_from)

    if date_to:
        logs = logs.filter(date__lte=date_to)

    if health_filter:
        logs = logs.filter(health_observation=health_filter)

    all_animals = Animal.objects.all().order_by('name')

    return render(request, 'manage_logs.html', {
        'logs': logs,
        'all_animals': all_animals,
        'animal_filter': animal_filter,
        'date_from': date_from,
        'date_to': date_to,
        'health_filter': health_filter,
    })
