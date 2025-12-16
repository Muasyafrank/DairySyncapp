// animal_registration.js - Simplified for single-page form with 6 essential fields

// Breed options based on species
const breedOptions = {
    'Cow': ['Holstein', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss', 'Crossbred', 'Other'],
    'Goat': ['Saanen', 'Alpine', 'Nubian', 'Boer', 'Toggenburg', 'Other'],
    'Sheep': ['Merino', 'Dorper', 'Suffolk', 'Hampshire', 'Other']
};

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    // Set today's date as default for DOB
    const dobField = document.getElementById('id_dob');
    if (dobField && !dobField.value) {
        dobField.value = new Date().toISOString().split('T')[0];
    }
    
    // Add event listeners
    const speciesSelect = document.getElementById('id_species');
    if (speciesSelect) {
        speciesSelect.addEventListener('change', function() {
            updateBreedOptions();
            generateAnimalId(); // Regenerate ID when species changes
        });
    }
    
    if (dobField) {
        dobField.addEventListener('change', calculateAge);
    }
    
    // Photo preview
    const photoInput = document.getElementById('id_photo');
    if (photoInput) {
        photoInput.addEventListener('change', previewPhoto);
    }
    
    // Initialize breed options if species is selected
    updateBreedOptions();
    
    // Calculate age if DOB is set
    if (dobField && dobField.value) {
        calculateAge();
    }
    
    // Generate initial animal ID
    generateAnimalId();
    
    // Setup form validation
    setupFormValidation();
}

// Update breed options based on selected species
function updateBreedOptions() {
    const speciesSelect = document.getElementById('id_species');
    const breedSelect = document.getElementById('id_breed');
    
    if (!speciesSelect || !breedSelect) return;
    
    const species = speciesSelect.value;
    
    // Keep current value
    const currentValue = breedSelect.value;
    
    // Clear options
    breedSelect.innerHTML = '<option value="">Select Breed</option>';
    
    if (species && breedOptions[species]) {
        breedOptions[species].forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
        
        // Restore current value if it exists
        if (currentValue) {
            breedSelect.value = currentValue;
        }
    }
}

// Generate animal ID based on species
function generateAnimalId() {
    const speciesSelect = document.getElementById('id_species');
    const animalIdField = document.getElementById('id_animal_id');
    
    if (!speciesSelect || !animalIdField) return;
    
    if (!speciesSelect.value) {
        animalIdField.value = ''; // Clear if no species selected
        return;
    }
    
    const speciesPrefix = {
        'Cow': 'COW',
        'Goat': 'GOAT',
        'Sheep': 'SHEEP'
    }[speciesSelect.value] || 'ANM';
    
    const date = new Date();
    const datePart = date.getFullYear().toString().slice(-2) + 
                    (date.getMonth() + 1).toString().padStart(2, '0') + 
                    date.getDate().toString().padStart(2, '0');
    
    const randomPart = Math.floor(Math.random() * 900 + 100); // 100-999
    
    const animalId = `${speciesPrefix}-${datePart}-${randomPart}`;
    animalIdField.value = animalId;
}

// Calculate age from date of birth
function calculateAge() {
    const dobField = document.getElementById('id_dob');
    const ageYearsField = document.getElementById('id_age_years');
    const ageMonthsField = document.getElementById('id_age_months');
    
    if (!dobField || !dobField.value) return;
    
    const dob = new Date(dobField.value);
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
    
    // Update fields if they exist
    if (ageYearsField) ageYearsField.value = years;
    if (ageMonthsField) ageMonthsField.value = months;
}

// Preview uploaded photo
function previewPhoto(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('photoPreview');
    const uploadArea = document.querySelector('.photo-upload-area');
    
    if (!file || !preview || !uploadArea) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        return;
    }
    
    // Validate file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
        alert('Only JPG and PNG images are allowed');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('animalForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        // Validate required fields
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalidField = null;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
                
                // Track first invalid field
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        // Validate date of birth not in future
        const dobField = document.getElementById('id_dob');
        if (dobField && dobField.value) {
            const dob = new Date(dobField.value);
            const today = new Date();
            
            if (dob > today) {
                dobField.classList.add('is-invalid');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = dobField;
                showFieldError(dobField, 'Date of birth cannot be in the future');
            }
        }
        
        if (!isValid) {
            e.preventDefault();
            
            // Scroll to first invalid field
            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalidField.focus();
            }
            
            // Show error message
            showToast('Please fill in all required fields marked with *', 'danger');
            return false;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        }
        
        return true;
    });
    
    // Real-time validation for required fields
    form.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
        
        field.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
}

// Show field-specific error message
function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message error-message mt-1';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear all validation errors
function clearValidationErrors() {
    const form = document.getElementById('animalForm');
    if (!form) return;
    
    // Remove invalid class from all fields
    form.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    // Remove all error messages
    form.querySelectorAll('.field-error-message').forEach(error => {
        error.remove();
    });
}

// Reset form to default state
function resetForm() {
    const form = document.getElementById('animalForm');
    if (form) {
        form.reset();
    }
    
    // Reset photo preview
    const preview = document.getElementById('photoPreview');
    const uploadArea = document.querySelector('.photo-upload-area');
    if (preview) {
        preview.style.display = 'none';
    }
    if (uploadArea) {
        uploadArea.style.display = 'block';
    }
    
    // Set today's date as default for DOB
    const dobField = document.getElementById('id_dob');
    if (dobField) {
        dobField.value = new Date().toISOString().split('T')[0];
    }
    
    // Clear validation errors
    clearValidationErrors();
    
    // Recalculate age
    calculateAge();
    
    // Regenerate ID
    generateAnimalId();
    
    // Update breed options
    updateBreedOptions();
    
    showToast('Form reset to default values', 'info');
}

// Show toast notification
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', function() {
        toastEl.remove();
    });
}

// Utility function to show loading state
function showLoading(message = 'Processing...') {
    // Create loading overlay if it doesn't exist
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                <p class="text-muted">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

// Utility function to hide loading state
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Initialize any modals that might exist
function initializeModals() {
    const successModalEl = document.getElementById('successModal');
    if (successModalEl && typeof bootstrap !== 'undefined') {
        window.successModal = new bootstrap.Modal(successModalEl);
    }
}

// Auto-dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
        alerts.forEach(alert => {
            if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
                const fade = new bootstrap.Alert(alert);
                fade.close();
            }
        });
    }, 5000);
});

// Export functions for use in HTML inline event handlers
window.generateAnimalId = generateAnimalId;
window.previewPhoto = previewPhoto;
window.resetForm = resetForm;