document.addEventListener('DOMContentLoaded', function() {
    const subscriptionSelect = document.getElementById('subscription');
    const assignButton = document.getElementById('assign-button');
    const statusMessage = document.getElementById('status-message');

    assignButton.addEventListener('click', function() {
        const selectedSubscription = subscriptionSelect.value;
        
        // Store subscription in localStorage
        if (selectedSubscription !== 'none') {
            localStorage.setItem('subscription', JSON.stringify({ subscription: selectedSubscription }));
            statusMessage.textContent = `Subscription ${selectedSubscription} assigned successfully!`;
        } else {
            localStorage.removeItem('subscription');
            statusMessage.textContent = 'No subscription assigned.';
        }
    });
});
