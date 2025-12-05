// forms.js
        // Page Navigation
        function showPage(pageId) {
            document.querySelectorAll('.auth-container').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
        }

        // Password Toggle
        function togglePassword(inputId, icon) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        // Password Strength Checker
        function checkPasswordStrength(input) {
            const password = input.value;
            const strengthDiv = document.getElementById('passwordStrength');
            const strengthText = strengthDiv.querySelector('.strength-text');
            
            if (password.length === 0) {
                strengthDiv.classList.remove('show');
                return;
            }

            strengthDiv.classList.add('show');
            
            let strength = 0;
            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            strengthDiv.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
            
            if (strength <= 2) {
                strengthDiv.classList.add('strength-weak');
                strengthText.textContent = 'Weak password';
            } else if (strength === 3) {
                strengthDiv.classList.add('strength-medium');
                strengthText.textContent = 'Medium password';
            } else {
                strengthDiv.classList.add('strength-strong');
                strengthText.textContent = 'Strong password';
            }
        }

        // Login Form Handler
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('.btn-primary');
            btn.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                btn.classList.remove('loading');
                alert('Login successful! Redirecting to dashboard...');
                // window.location.href = '/dashboard';
            }, 2000);
        });

        // Register Form Handler
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            const btn = this.querySelector('.btn-primary');
            btn.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                btn.classList.remove('loading');
                alert('Registration successful! Please check your email to verify your account.');
                showPage('loginPage');
            }, 2000);
        });

        // Reset Form Handler
        document.getElementById('resetForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            const btn = this.querySelector('.btn-primary');
            const alertDiv = document.getElementById('resetAlert');
            
            btn.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                btn.classList.remove('loading');
                alertDiv.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i>
                        Password reset link has been sent to ${email}. Please check your inbox.
                    </div>
                `;
                document.getElementById('resetEmail').value = '';
            }, 2000);
        });

        // Social Login Handlers
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const provider = this.textContent.trim();
                alert(`${provider} login coming soon!`);
            });
        });
