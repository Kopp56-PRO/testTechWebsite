document.addEventListener('DOMContentLoaded', function() {
    const noSubscriptionSection = document.getElementById('no-subscription-section');
    const subscriptionSelectionSection = document.getElementById('subscription-selection-section');
    const stepsContainer = document.getElementById('steps-container');
    const subscriptionButtons = {
        'premium': document.getElementById('subscription-premium'),
        'starter': document.getElementById('subscription-starter'),
        'basic': document.getElementById('subscription-basic'),
        'learn': document.getElementById('subscription-learn')
    };
    
    const sizeButtons = {
        'for-learning': document.getElementById('size-for-learning'),
        'basic': document.getElementById('size-basic'),
        'standard': document.getElementById('size-standard'),
        'pro': document.getElementById('size-pro')
    };

    const subscriptionMessage = document.getElementById('subscription-message');
    const requestButton = document.getElementById('request-button');
    const nextStep1Button = document.getElementById('next-step-1');
    const nextStep2Button = document.getElementById('next-step-2');
    const submitRequestButton = document.getElementById('submit-request');
    const confirmationMessage = document.getElementById('confirmation-message');

    function getSubscriptionData() {
        let subscriptionData = null;
        try {
            const data = localStorage.getItem('subscription');
            if (data) {
                subscriptionData = JSON.parse(data);
                if (typeof subscriptionData === 'object' && subscriptionData !== null) {
                    return subscriptionData.subscription;
                } else {
                    console.error('Subscription data is not in expected format:', subscriptionData);
                    return null;
                }
            }
        } catch (e) {
            console.error('Failed to parse subscription data from local storage:', e);
        }
        return null;
    }

    const userSubscription = getSubscriptionData();

    function displaySubscriptionScreen() {
        if (userSubscription) {
            noSubscriptionSection.style.display = 'none';
            subscriptionSelectionSection.style.display = 'block';
            stepsContainer.style.display = 'block';

            // Show the appropriate subscription buttons based on userSubscription
            switch (userSubscription) {
                case 'premium':
                    subscriptionButtons['premium'].style.display = 'inline-block';
                    break;
                case 'starter':
                    subscriptionButtons['starter'].style.display = 'inline-block';
                    break;
                case 'basic':
                    subscriptionButtons['basic'].style.display = 'inline-block';
                    break;
                case 'learn':
                    subscriptionButtons['learn'].style.display = 'inline-block';
                    break;
                default:
                    console.error('Unexpected subscription value:', userSubscription);
                    break;
            }

            // Add event listeners to subscription buttons
            Object.keys(subscriptionButtons).forEach(key => {
                subscriptionButtons[key].addEventListener('click', () => {
                    localStorage.setItem('selectedSubscription', key);
                    document.getElementById('step-1').style.display = 'none';
                    document.getElementById('step-2').style.display = 'block';
                    handleSizeSelection();
                });
            });
        } else {
            noSubscriptionSection.style.display = 'block';
            subscriptionMessage.textContent = "It looks like you don't have a subscription! If you got a subscription recently, try logging out and logging in again. Also check if your subscription is in the account you are logged in.";
            requestButton.disabled = false;
            requestButton.addEventListener('click', () => {
                // Redirect to subscription page or open a modal to request subscription
                window.location.href = '/subscriptions'; // Update with actual path to subscription page
            });
        }
    }

    function handleSizeSelection() {
        const availableSizes = {
            'learn': ['For Learning'],
            'starter': ['For Learning', 'Basic'],
            'standard': ['For Learning', 'Basic', 'Standard'],
            'premium': ['For Learning', 'Basic', 'Standard', 'Pro']
        };

        // Disable all buttons initially
        Object.values(sizeButtons).forEach(button => {
            button.disabled = true;
            button.addEventListener('mouseover', () => {
                if (button.disabled) {
                    button.title = "Your subscription does not allow this size!";
                }
            });
        });

        // Enable size buttons based on subscription
        if (availableSizes[userSubscription]) {
            availableSizes[userSubscription].forEach(size => {
                sizeButtons[size.toLowerCase().replace(' ', '-')].disabled = false;
            });
        }

        Object.values(sizeButtons).forEach(button => {
            button.addEventListener('click', () => {
                localStorage.setItem('selectedSize', button.textContent);
                document.getElementById('step-2').style.display = 'none';
                document.getElementById('step-3').style.display = 'block';
            });
        });

        submitRequestButton.addEventListener('click', () => {
            const selectedOS = document.getElementById('os-select').value;
            const selectedSize = localStorage.getItem('selectedSize');
            const selectedSubscription = localStorage.getItem('selectedSubscription');

            const requestData = {
                email: localStorage.getItem('email'),
                username: localStorage.getItem('username'),
                subscription: selectedSubscription,
                size: selectedSize,
                os: selectedOS
            };

            fetch('/submit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            }).then(response => {
                if (response.ok) {
                    document.getElementById('step-3').style.display = 'none';
                    confirmationMessage.style.display = 'block';
                }
            });
        });
    }

    // Initialize the page
    displaySubscriptionScreen();
});
