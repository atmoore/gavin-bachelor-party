document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('success-message');
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        e.target.value = value;
    });
    
    // Venmo username validation
    const venmoInput = document.getElementById('venmo');
    venmoInput.addEventListener('input', function(e) {
        let value = e.target.value;
        if (value && !value.startsWith('@')) {
            e.target.value = '@' + value;
        }
    });
    
    // Form validation
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const venmo = document.getElementById('venmo').value.trim();
        const fridayDinner = document.querySelector('input[name="friday-dinner"]:checked');
        
        // Clear previous error styling
        clearErrors();
        
        let isValid = true;
        const errors = [];
        
        // Name validation
        if (!name) {
            showError('name', 'Full name is required');
            isValid = false;
        }
        
        
        // Phone validation
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
        if (!phone) {
            showError('phone', 'Phone number is required');
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            showError('phone', 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Venmo validation
        const venmoRegex = /^@[a-zA-Z0-9_-]+$/;
        if (!venmo) {
            showError('venmo', 'Venmo username is required');
            isValid = false;
        } else if (!venmoRegex.test(venmo)) {
            showError('venmo', 'Please enter a valid Venmo username (e.g., @username)');
            isValid = false;
        }
        
        // Friday dinner validation
        if (!fridayDinner) {
            showError('friday-dinner', 'Please select if you\'ll attend Friday dinner');
            isValid = false;
        }
        
        return isValid;
    }
    
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // For radio buttons, find the parent form group
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.style.marginBottom = '10px';
            
            // Create error message element
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = '#e74c3c';
            errorElement.style.fontSize = '0.9em';
            errorElement.style.marginTop = '5px';
            errorElement.textContent = message;
            
            formGroup.appendChild(errorElement);
        }
        
        // Style the field
        if (field.type === 'radio') {
            // For radio buttons, highlight the entire group
            const radioInputs = document.querySelectorAll(`input[name="${field.name}"]`);
            radioInputs.forEach(input => {
                input.style.accentColor = '#e74c3c';
            });
        } else {
            field.style.borderColor = '#e74c3c';
            field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
        }
    }
    
    function clearErrors() {
        // Remove error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        // Reset field styling
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.style.borderColor = '#e9ecef';
            field.style.boxShadow = '';
            field.style.accentColor = '';
        });
        
        // Reset form group margins
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.style.marginBottom = '';
        });
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            // Scroll to first error
            const firstError = document.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Submit to Formspree
        const submitButton = form.querySelector('.submit-btn');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Create FormData from the form
        const formData = new FormData(form);
        
        // Submit to Formspree
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Success
                successMessage.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    document.body.style.overflow = '';
                    form.reset();
                }, 5000);
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting your RSVP. Please try again or contact Austin directly.');
        })
        .finally(() => {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });
    
    // Close success message when clicked
    successMessage.addEventListener('click', function() {
        this.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    // Real-time validation feedback
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            // Only validate if the field has been filled
            if (this.value.trim()) {
                validateForm();
            }
        });
    });
});