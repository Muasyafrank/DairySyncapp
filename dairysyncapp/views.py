# animals/views.py
from django.shortcuts import render, redirect, get_object_or_404
from dairysyncapp.models import*

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
def animal_registration_page(request):
    return render(request,'registration.html')    

# Listing Page
def animal_listing_page(request):
    return render(request, 'Animals.html')




    try:
        data = json.loads(request.body)
        
        date = data.get('date')
        entries = data.get('entries', [])
        
        if not date:
            return JsonResponse({
                'success': False,
                'error': 'Date is required'
            }, status=400)
        
        created_count = 0
        updated_count = 0
        errors = []
        
        for entry in entries:
            try:
                animal_id = entry.get('animal_id')
                morning_yield = float(entry.get('morning_yield', 0))
                evening_yield = float(entry.get('evening_yield', 0))
                quality = entry.get('quality', 'good')
                
                if not animal_id:
                    errors.append('Missing animal ID in one of the entries')
                    continue
                
                # Get animal
                try:
                    animal = Animal.objects.get(animal_id=animal_id)
                except Animal.DoesNotExist:
                    errors.append(f'Animal with ID {animal_id} not found')
                    continue
                
                # Create or update milk log
                milk_log, created = MilkLog.objects.update_or_create(
                    animal=animal,
                    date=date,
                    defaults={
                        'morning_yield': morning_yield,
                        'evening_yield': evening_yield,
                        'quality': quality,
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
                    
            except Exception as e:
                errors.append(str(e))
                continue
        
        return JsonResponse({
            'success': True,
            'message': f'Bulk milk entry completed: {created_count} created, {updated_count} updated',
            'created': created_count,
            'updated': updated_count,
            'errors': errors if errors else None,
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)