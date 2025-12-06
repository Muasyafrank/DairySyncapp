// animal_registration.js - Handles animal registration form

let currentStep = 1;
let animalPhoto = null;

// Breed options based on species
const breedOptions = {
    'Cow': ['Holstein', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss', 'Crossbred', 'Other'],
    'Buffalo': ['Murrah', 'Nili-Ravi', 'Jaffarabadi', 'Surti', 'Mehsana', 'Other'],
    'Goat': ['Saanen', 'Alpine', 'Nubian', 'Boer', 'Toggenburg', 'Other'],
    'Sheep': ['Merino', 'Dorper', 'Suffolk', 'Hampshire', 'Other']
};

// Initialize form
function initializeForm() {
    // Set today's date as default for DOB and acquisition date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dob').value = today;
    document.getElementById('acquisition_date').value = today;
    
    // Add event listeners
    document.getElementById('species').addEventListener('change', updateBreedOptions);
    document.getElementById('source').addEventListener('change', toggleSourceFields);
    document.getElementById('dob').addEventListener('change', calculateAge);
    
    // Initialize breed options
    updateBreedOptions();
}

// Generate animal ID
function generateAnimalId() {
    const species = document.getElementById('species').value;
    
    if (!species) {
        showError('Please select a species first');
        return;
    }
    
    const speciesPrefix = {
        'Cow': 'COW',
        'Buffalo': 'BUF',
        'Goat': 'GOA',
        'Sheep': 'SHE'
    }[species] || 'ANM';
    
    const date = new Date();
    const datePart = date.getFullYear().toString().slice(-2) + 
                    (date.getMonth() + 1).toString().padStart(2, '0') + 
                    date.getDate().toString().padStart(2, '0');
    
    const randomPart = Math.floor(Math.random() * 900 + 100); // 100-999
    
    const animalId = `${speciesPrefix}-${datePart}-${randomPart}`;
    document.getElementById('animal_id').value = animalId;
}

// Update breed options based on selected species
function updateBreedOptions() {
    const species = document.getElementById('species').value;
    const breedSelect = document.getElementById('breed');
    
    // Clear existing options
    breedSelect.innerHTML = '<option value="">Select Breed</option>';
    
    if (species && breedOptions[species]) {
        breedOptions[species].forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    }
}

// Toggle source-specific fields
function toggleSourceFields() {
    const source = document.getElementById('source').value;
    const purchaseFields = document.getElementById('purchaseFields');
    const sellerFields = document.getElementById('sellerFields');
    
    if (source === 'purchased') {
        purchaseFields.style.display = 'block';
        sellerFields.style.display = 'block';
    } else {
        purchaseFields.style.display = 'none';
        sellerFields.style.display = 'none';
    }
}

// Calculate age from date of birth
function calculateAge() {
    const dobInput = document.getElementById('dob');
    const yearsInput = document.getElementById('age_years');
    const monthsInput = document.getElementById('age_months');
    
    if (dobInput.value) {
        const dob = new Date(dobInput.value);
        const today = new Date();
        
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        // Adjust for day of month
        if (today.getDate() < dob.getDate()) {
            months--;
            if (months < 0) {
                years--;
                months += 12;
            }
        }
        
        yearsInput.value = years;
        monthsInput.value = months;
    }
}

// Preview uploaded photo
function previewPhoto(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('photoPreview');
    const uploadArea = document.querySelector('.photo-upload-area');
    
    if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showError('File size must be less than 5MB');
            event.target.value = ''; // Clear the input
            return;
        }
        
        // Validate file type
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            showError('Only JPG and PNG images are allowed');
            event.target.value = '';
            return;
        }
        
        animalPhoto = file;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadArea.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Form navigation
function nextStep() {
    if (validateStep(currentStep)) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        updateStepIndicator(currentStep, 'completed');
        
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateStepIndicator(currentStep, 'active');
        
        // Scroll to top of step
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    updateStepIndicator(currentStep, '');
    
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateStepIndicator(currentStep, 'active');
    
    // Scroll to top of step
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepIndicator(step, status) {
    const stepElement = document.querySelector(`.step[data-step="${step}"]`);
    if (stepElement) {
        // Remove all status classes
        stepElement.classList.remove('active', 'completed');
        
        // Add new status class
        if (status) {
            stepElement.classList.add(status);
        }
    }
}

// Step validation
function validateStep(step) {
    let isValid = true;
    const stepElement = document.getElementById(`step${step}`);
    
    // Get all required inputs in this step
    const requiredInputs = stepElement.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            markFieldInvalid(input, 'This field is required');
        } else {
            markFieldValid(input);
            
            // Additional validation for specific fields
            if (input.type === 'date') {
                const date = new Date(input.value);
                const today = new Date();
                
                if (date > today) {
                    isValid = false;
                    markFieldInvalid(input, 'Date cannot be in the future');
                }
            }
            
            if (input.type === 'number') {
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);
                const value = parseFloat(input.value);
                
                if (!isNaN(min) && value < min) {
                    isValid = false;
                    markFieldInvalid(input, `Value must be at least ${min}`);
                }
                
                if (!isNaN(max) && value > max) {
                    isValid = false;
                    markFieldInvalid(input, `Value must be at most ${max}`);
                }
            }
        }
    });
    
    // Custom validation for step 1
    if (step === 1) {
        const species = document.getElementById('species').value;
        if (!species) {
            isValid = false;
            markFieldInvalid(document.getElementById('species'), 'Please select a species');
        }
    }
    
    return isValid;
}

function markFieldInvalid(field, message) {
    field.classList.add('is-invalid');
    
    // Add or update feedback message
    let feedback = field.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentNode.appendChild(feedback);
    }
    feedback.textContent = message;
}

function markFieldValid(field) {
    field.classList.remove('is-invalid');
    
    // Remove feedback message if exists
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.remove();
    }
}

// Main form validation and submission
function validateAndSubmit() {
    // Validate all steps
    for (let i = 1; i <= 3; i++) {
        if (!validateStep(i)) {
            // Go to the first invalid step
            if (currentStep !== i) {
                document.getElementById(`step${currentStep}`).classList.remove('active');
                currentStep = i;
                document.getElementById(`step${currentStep}`).classList.add('active');
                updateStepIndicator(currentStep, 'active');
            }
            
            showError('Please fix all validation errors before submitting');
            return;
        }
    }
    
    // Show confirmation
    showConfirm('Register Animal', 'Are you sure you want to register this animal?', submitForm);
}

function submitForm() {
    showLoading('Registering animal...');
    
    // Collect form data
    const formData = new FormData();
    
    // Add all form fields
    const formElements = document.getElementById('animalForm').elements;
    for (let element of formElements) {
        if (element.name && element.value) {
            if (element.type === 'file') {
                if (animalPhoto) {
                    formData.append(element.name, animalPhoto);
                }
            } else {
                formData.append(element.name, element.value);
            }
        }
    }
    
    // Convert FormData to JSON for API call
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Make API call
    fetch('/animals/api/animals/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        hideLoading();
        
        if (result.success) {
            showSuccess(result.message);
            
            // Check if "Add another" is checked
            const addAnother = document.getElementById('addAnother').checked;
            
            if (addAnother) {
                // Reset form for next animal
                setTimeout(() => {
                    resetForm();
                    showSuccess('Animal registered successfully! Ready for next entry.');
                }, 2000);
            } else {
                // Show success with option to view animals
                document.getElementById('successMessage').innerHTML = `
                    ${result.message}<br>
                    <small class="text-muted">ID: ${result.animal_id}</small>
                `;
            }
        } else {
            showError(result.error || 'Failed to register animal');
        }
    })
    .catch(error => {
        hideLoading();
        showError('Network error. Please check your connection and try again.');
        console.error('Error:', error);
    });
}

// Form reset
function resetForm() {
    document.getElementById('animalForm').reset();
    
    // Reset steps
    currentStep = 1;
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step1').classList.add('active');
    
    // Reset step indicators
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-step="1"]').classList.add('active');
    
    // Reset photo
    const preview = document.getElementById('photoPreview');
    const uploadArea = document.querySelector('.photo-upload-area');
    preview.style.display = 'none';
    uploadArea.style.display = 'block';
    animalPhoto = null;
    
    // Clear validation errors
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
    });
    
    // Generate new ID
    generateAnimalId();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dob').value = today;
    document.getElementById('acquisition_date').value = today;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cancel confirmation
function showCancelConfirmationModal() {
    cancelConfirmationModal.show();
}

function redirectToList() {
    window.location.href = '/animals/list/';
}

// Utility functions
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showLoading(message = 'Processing...') {
    document.getElementById('loadingMessage').textContent = message;
    loadingModal.show();
}

function hideLoading() {
    loadingModal.hide();
}

function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    successModal.show();
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorModal.show();
}

function showConfirm(title, message, onConfirm) {
    // Simple confirmation alert - can be enhanced with a modal
    if (confirm(`${title}\n\n${message}`)) {
        onConfirm();
    }
}

// Toast notifications
function showToast(message, type = 'success') {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const toastBody = document.createElement('div');
    toastBody.className = 'd-flex';
    
    toastBody.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    `;
    
    toast.appendChild(toastBody);
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toastContainer.remove();
    });
}