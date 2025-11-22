const BACKEND_URL = 'https://crowdfundingbackend-1.onrender.com';
let currentCampaign = null;

document.addEventListener('DOMContentLoaded', function() {
    const campaignId = getCampaignIdFromURL();
    if (campaignId) {
        initializeDashboard(campaignId);
    } else {
        showError('No campaign ID found in URL');
    }

    setupEventListeners();
});

async function initializeDashboard(campaignId) {
    try {
        await loadCampaignData(campaignId);
        await loadDashboardStats(campaignId);
        await loadRecentActivity(campaignId);
        await loadRecentDonors(campaignId);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard data');
    }
}


function getCampaignIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function setupEventListeners() {
    const editBtn = document.querySelector('.dashboard-btn.primary-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const campaignId = getCampaignIdFromURL();
            window.location.href = `/components/edit-campaign.html?id=${campaignId}`;
        });
    }

    const shareBtn = document.querySelector('.dashboard-btn.secondary-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareCampaign);
    }

    const quickActionBtns = document.querySelectorAll('.sidebar-card .dashboard-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            handleQuickAction(action);
        });
    });
}


async function loadCampaignData(campaignId) {
    try {
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(`${BACKEND_URL}/api/users/usercampaign/${campaignId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch campaign data');
        }

        const campaign = await response.json();
        currentCampaign = campaign;
        
        updateCampaignUI(campaign);
        
    } catch (error) {
        console.error('Error loading campaign:', error);
        showError('Failed to load campaign data');
    }
}

function updateCampaignUI(campaign) {
    const campaignTitle = document.querySelector('.main-content h3');
    if (campaignTitle) {
        campaignTitle.textContent = campaign.title;
    }

    const statusElement = document.querySelector('.campaign-status');
    if (statusElement) {
        statusElement.textContent = campaign.status;
        statusElement.className = `campaign-status ${campaign.status.toLowerCase()}`;
    }

    updatePreviewSection(campaign);
}

function updatePreviewSection(campaign) {
    const previewTitle = document.querySelector('.preview-title');
    const previewDescription = document.querySelector('.preview-description');
    const previewImage = document.querySelector('.preview-image');
    
    if (previewTitle) previewTitle.textContent = campaign.title;
    if (previewDescription) previewDescription.textContent = campaign.description.substring(0, 150) + '...';

    if (campaign.images && campaign.images.length > 0 && previewImage) {
        previewImage.style.backgroundImage = `url('${campaign.images[0]}')`;
        previewImage.style.backgroundSize = 'cover';
        previewImage.style.backgroundPosition = 'center';
    }

    const previewLink = document.querySelector('.preview-link');
    if (previewLink) {
        if (campaign.status === 'Approved') {
            previewLink.href = `/components/campaign_page.html?id=${campaign.campaign_id}`;
            previewLink.addEventListener('click', () => true); // normal behavior
        } else {
            previewLink.removeAttribute('href'); // disable link
            previewLink.addEventListener('click', (e) => {
                e.preventDefault(); // prevent navigation
                alert('Campaign is Not Approved Yet.');
            });
        }
    }
}

// Load dashboard statistics
async function loadDashboardStats(campaignId) {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${BACKEND_URL}/api/users/dashboard-stats/${campaignId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            console.log(stats);
            updateDashboardStats(stats);
        } else {
            console.warn('Failed to load dashboard stats');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    // Update main stat cards
    const totalRaised = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const totalDonors = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const daysRemaining = document.querySelector('.stat-card:nth-child(3) .stat-value');
    
    if (totalRaised) totalRaised.textContent = formatCurrency(stats.totalDonated);
    if (totalDonors) totalDonors.textContent = stats.totalDonors?.toLocaleString() || '0';
    if (daysRemaining) daysRemaining.textContent = Number(stats.daysLeft) >= 0 ? stats.daysLeft:  'Completed';
    
    // Update progress bar
    const progressPercentage = (Number(stats.totalDonated)/Number(stats.goalAmount)) * 100;
    console.log(progressPercentage)
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    }
    
    // Update quick stats
    const quickStats = document.querySelectorAll('.quick-stat .quick-value');
    console.log(stats)
    if (quickStats.length >= 4) {
        quickStats[0].textContent = `${Math.round(progressPercentage)}%`; // Progress percentage
        quickStats[1].textContent = formatCurrency(stats.leftDonation); // Amount needed
        quickStats[2].textContent = stats.donationsToday || '0'; // New donors today
        quickStats[3].textContent = formatCurrency(stats.avgDonation || 0); // Average donation
        quickStats[4].textContent = stats.totalShares || '0';
        quickStats[5].textContent = stats.totalComments || '0';
    }
}

// Load recent activity
async function loadRecentActivity(campaignId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_URL}/api/campaigns/${campaignId}/recent-activity`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const activity = await response.json();
            updateRecentActivity(activity);
        } else {
            // Show placeholder if no activity
            updateRecentActivity([]);
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
        updateRecentActivity([]);
    }
}

// Update recent activity feed
function updateRecentActivity(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = '';

    if (activities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">No recent activity yet</div>
                    <div class="activity-time">Share your campaign to get more engagement!</div>
                </div>
            </li>
        `;
        return;
    }

    activities.forEach(activity => {
        const activityItem = createActivityItem(activity);
        activityList.appendChild(activityItem);
    });
}

// Create activity item HTML
function createActivityItem(activity) {
    const item = document.createElement('li');
    item.className = 'activity-item';
    
    const icon = getActivityIcon(activity.type);
    const content = getActivityContent(activity);
    
    item.innerHTML = `
        <div class="activity-icon">
            <i class="${icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-title">${content.title}</div>
            <div class="activity-time">${formatTime(activity.created_at)}</div>
        </div>
        ${activity.amount ? `<div class="activity-amount">${formatCurrency(activity.amount)}</div>` : ''}
    `;
    
    return item;
}

// Load recent donors
async function loadRecentDonors(campaignId) {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${BACKEND_URL}/api/campaigns/recent-donors/${campaignId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const donors = await response.json();
            console.log(donors);
            updateRecentDonors(donors);
        } else {
            updateRecentDonors([]);
        }
    } catch (error) {
        console.error('Error loading recent donors:', error);
        updateRecentDonors([]);
    }
}

function updateRecentDonors(donors) {
    const donorList = document.querySelector('.donor-list');
    if (!donorList) return;

    donorList.innerHTML = '';

    if (donors.length === 0) {
        donorList.innerHTML = `
            <li class="donor-item">
                <div class="donor-avatar">?</div>
                <div class="donor-name">No donors yet</div>
                <div class="donor-amount">₹ 0</div>
            </li>
        `;
        return;
    }

    donors.forEach(donor => {
        const donorItem = createDonorItem(donor);
        donorList.appendChild(donorItem);
    });
}


function createDonorItem(donor) {
    const item = document.createElement('li');
    item.className = 'donor-item';

    const name = donor?.user_id?.name || "Unknown Donor";
    const amount = donor.amount || 0;
    const image = donor?.user_id?.user_image;
    const initials = getInitials(name);

    item.innerHTML = `
        <div class="donor-avatar">
            ${initials}
        </div>
        <div class="donor-name">${name}</div>
        <div class="donor-amount">${formatCurrency(amount)}</div>
    `;

    return item;
}


// Handle quick actions
function handleQuickAction(action) {
    const campaignId = getCampaignIdFromURL();
    
    switch(action) {
        case 'Post an Update':
            postUpdate();
            break;
        case 'View Analytics':
            viewAnalytics(campaignId);
            break;
        case 'Thank Donors':
            thankDonors();
            break;
        default:
            console.log('Action not implemented:', action);
    }
}


// View analytics
function viewAnalytics(campaignId) {
    // Navigate to analytics page or show modal
    console.log('Viewing analytics for campaign:', campaignId);
    showNotification('Opening analytics...', 'info');
    
    // You can implement a modal or redirect to analytics page
    // window.location.href = `/analytics.html?id=${campaignId}`;
}

// Thank donors
function thankDonors() {
    // Implement thank you functionality
    console.log('Thanking donors...');
    showNotification('Sending thank you messages...', 'success');
}

// Share campaign
function shareCampaign() {
    const campaignId = getCampaignIdFromURL();
    const shareLink = `${window.location.origin}/components/Campaign_page.html?id=${campaignId}`;
    const campaignTitle = currentCampaign?.title || 'My Campaign';
    
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: campaignTitle,
            text: `Check out my campaign: ${campaignTitle}`,
            url: shareLink,
        }).then(() => {
            console.log('Campaign shared successfully');
        }).catch(err => {
            console.log('Error sharing:', err);
            copyToClipboard(shareLink);
        });
    } else {
        // Fallback to copy to clipboard
        copyToClipboard(shareLink);
    }
}

// View public campaign
function viewPublicCampaign() {
    const campaignId = getCampaignIdFromURL();
    window.open(`/components/Campaign_page.html?id=${campaignId}`);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Campaign link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy link', 'error');
    });
}

// Utility Functions
function formatCurrency(amount) {
    if (!amount) return '₹ 0';
    
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatTime(timestamp) {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now - time;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    
    if (diffInHours < 1) {
        const minutes = Math.floor(diffInMs / (1000 * 60));
        return minutes <= 0 ? 'Just now' : `${minutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
        return `${Math.floor(diffInDays)} days ago`;
    } else {
        return time.toLocaleDateString();
    }
}

function getActivityIcon(type) {
    const icons = {
        'donation': 'fas fa-donate',
        'update': 'fas fa-bullhorn',
        'comment': 'fas fa-comment',
        'share': 'fas fa-share-alt'
    };
    return icons[type] || 'fas fa-info-circle';
}

function getActivityContent(activity) {
    switch (activity.type) {
        case 'donation':
            return {
                title: `New donation from ${activity.user_name}`
            };
        case 'update':
            return {
                title: `Update: ${activity.content?.substring(0, 60) || 'New update'}...`
            };
        case 'comment':
            return {
                title: `New comment from ${activity.user_name}`
            };
        case 'share':
            return {
                title: `Shared by ${activity.user_name}`
            };
        default:
            return { title: 'New activity' };
    }
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}
// Modal Elements
const modal = document.getElementById("updateModal");
const openModalBtn = document.getElementById('postUpdateBtn'); // "Post an Update" button
const closeModalBtn = document.querySelector(".close");
const updateForm = document.getElementById("updateForm");
const updateMessage = document.getElementById("updateMessage");

// Get campaign_id from URL
const urlParams = new URLSearchParams(window.location.search);
const campaignId = urlParams.get("campaign_id");

// Open modal
openModalBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// Close modal
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close if clicked outside modal
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Submit update
updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const updateText = document.getElementById("updateText").value.trim();
  const accessToken = localStorage.getItem("accessToken");
  const campaignId = getCampaignIdFromURL();

  if (!updateText) return;

  try {
    const res = await fetch(`http://localhost:3000/api/campaigns/${campaignId}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ update_text: updateText })
    });

    const data = await res.json();

    if (res.ok) {
      updateMessage.style.color = "green";
      updateMessage.textContent = "Update posted successfully!";
      updateForm.reset();
      setTimeout(() => modal.style.display = "none", 1500);
    } else {
      updateMessage.style.color = "red";
      updateMessage.textContent = data.message || "Failed to post update.";
    }
  } catch (err) {
    console.error(err);
    updateMessage.style.color = "red";
    updateMessage.textContent = "Something went wrong.";
  }
});

setInterval(() => {
    const campaignId = getCampaignIdFromURL();
    if (campaignId) {
        loadDashboardStats(campaignId);
        loadRecentActivity(campaignId);
        loadRecentDonors(campaignId);
    }
}, 30000);