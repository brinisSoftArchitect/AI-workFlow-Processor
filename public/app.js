document.addEventListener('DOMContentLoaded', function() {
  // License status display
  const licenseInfoElement = document.getElementById('licenseInfo');
  
  // Show license information if available
  if (licenseInfoElement) {
    function checkLicenseStatus() {
      fetch('/api/license-status')
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            // Format expiration date
            const expiryDate = new Date(data.expiresAt);
            const formattedDate = expiryDate.toLocaleDateString();
            
            // Show trial usage limits if applicable
            let usageInfo = '';
            if (data.plan === 'trial' && data.usageCount !== undefined) {
              usageInfo = `<p><strong>Usage:</strong> ${data.usageCount}/${data.maxUsage} allowed runs</p>`;
            }
            
            licenseInfoElement.innerHTML = `
              <div class="license-valid">
                <p><strong>License Status:</strong> Active</p>
                <p><strong>Plan:</strong> ${data.plan}</p>
                <p><strong>Expires:</strong> ${formattedDate}</p>
                <p><strong>User:</strong> ${data.user.firstName} ${data.user.lastName}</p>
                ${usageInfo}
                <p><small>Last verified: ${new Date().toLocaleTimeString()}</small></p>
              </div>
            `;
            
            // Add class if license is about to expire
            const today = new Date();
            const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry <= 7) {
              licenseInfoElement.classList.add('license-expired');
              licenseInfoElement.querySelector('.license-valid').innerHTML += 
                `<p class="expiry-warning">Your license will expire in ${daysUntilExpiry} days. Please renew soon.</p>`;
            }
            
            // Add warning if trial is nearly used up
            if (data.plan === 'trial' && data.usageCount && data.maxUsage) {
              const remainingUses = data.maxUsage - data.usageCount;
              if (remainingUses <= 1) {
                licenseInfoElement.classList.add('license-expired');
                licenseInfoElement.querySelector('.license-valid').innerHTML += 
                  `<p class="expiry-warning">Warning: You have only ${remainingUses} use${remainingUses === 1 ? '' : 's'} remaining on your trial license.</p>`;
              }
            }
          } else if (data.status === 'pending') {
            licenseInfoElement.innerHTML = `
              <div class="license-pending">
                <p><strong>License Status:</strong> Pending Approval</p>
                <p>Your trial license is awaiting administrator approval.</p>
                <p>Please check back later or contact support.</p>
                <p><small>Last checked: ${new Date().toLocaleTimeString()}</small></p>
              </div>
            `;
            licenseInfoElement.classList.add('license-pending');
          } else {
            licenseInfoElement.innerHTML = `
              <div class="license-invalid">
                <p><strong>License Status:</strong> Invalid</p>
                <p>${data.message || 'Please register or activate your license'}</p>
                <p><small>Last checked: ${new Date().toLocaleTimeString()}</small></p>
              </div>
            `;
            licenseInfoElement.classList.add('license-expired');
          }
        })
        .catch(error => {
          console.error('Error fetching license status:', error);
          licenseInfoElement.innerHTML = `
            <div class="license-error">
              <p><strong>License Status:</strong> Unknown</p>
              <p>Could not verify license. You may be offline.</p>
              <p><small>Last attempt: ${new Date().toLocaleTimeString()}</small></p>
            </div>
          `;
          licenseInfoElement.classList.add('license-expired');
        });
    }
    
    // Check license status immediately on page load
    checkLicenseStatus();
    
    // Set up periodic check every 5 minutes
    setInterval(checkLicenseStatus, 5 * 60 * 1000);
  }
});
