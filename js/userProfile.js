document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("editModal");
  const closeBtn = document.querySelector(".close-btn");
  const editForm = document.getElementById("edit-profile-form");

  const userProfileContainer = document.querySelector('.user-profile');
  const userDonations = document.querySelector('.user-donations');
  const campaignsContainer = document.querySelector('.user-campaigns');

  const accessToken = localStorage.getItem('accessToken');

  // --------- Fetch User Profile ---------
  async function fetchUserProfile() {
    try {
      const res = await fetch(`https://crowdfundingbackend-1.onrender.com/api/users/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      currentUserData = data
      userProfileContainer.innerHTML = `
        <section class="user-details">
          <div class="user-img">
            <img src="${data.user_image || '/assets/single-man-icon-people-icon-user-profile-symbol-person-symbol-businessman-stock-vector.jpg'}" alt="User Image"/>
          </div>
          <section class="user-info">
            <h2 class="user-name">${data.name}</h2>
            <span class="user-location">${data.location || ''}</span>
            <div class="stats">
              <span>Donations Made: ${data.donationsMade || 0}</span>
              <span>Campaigns Started: ${data.campaignsCreated || 0}</span>
            </div>
            <button id="logout-btn">Logout</button>
          </section>
          <button type="button" class="edit-btn">Edit</button>
          <i class="fas fa-ellipsis-v"></i>
        </section>
        <h1>About Me</h1>
        <section class="user-bio">
          ${data.about_user || ''}
        </section>
      `;

      // Re-attach Edit button event listener
      const editBtn = document.querySelector(".edit-btn");
      editBtn.addEventListener("click", () => {
         document.getElementById("name").value = currentUserData.name || '';
        if (document.getElementById("email")) document.getElementById("email").value = currentUserData.email || '';
        document.getElementById("location").value = currentUserData.location || '';
        document.getElementById("bio").value = currentUserData.about_user || '';
        modal.style.display = "block";
      });

      // Re-attach Logout button
      const logoutBtn = document.getElementById("logout-btn");
      logoutBtn.addEventListener("click", handleLogout);

    } catch (err) {
      alert("Failed to fetch user profile");
      console.error(err);
    }
  }

  // --------- Fetch User Donations ---------
  async function fetchUserDonations() {
    try {
      const res = await fetch(`https://crowdfundingbackend-1.onrender.com/api/users/userdonations`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const donations = await res.json();
      userDonations.innerHTML = '';

      donations.slice(0, 4).forEach(async (donation) => {
        const resCampaign = await fetch(`https://crowdfundingbackend-1.onrender.com/api/campaigns/${donation.campaign_id}`);
        const campaign = await resCampaign.json();

        const donationCard = document.createElement('div');
        donationCard.classList.add('donation-card');
        donationCard.innerHTML = `
          <img src="${campaign.images[0]}" alt="Campaign" />
          <div class="donation-info">
            <h3>${campaign.title}</h3>
            <p>${new Date(donation.donation_date).toLocaleDateString()}</p>
            <p>Donated: <strong>${donation.amount}</strong></p>
            <span class="status">${donation.transaction_type}</span>
          </div>
          <a href="#" class="receipt-link">Receipt</a>
        `;
        userDonations.appendChild(donationCard);
      });

      if (donations.length === 0) userDonations.innerHTML = "<p>No Donations Made</p>";

    } catch (err) {
      console.error(err);
      userDonations.innerHTML = "<p>No Donations Made</p>";
    }
  }

  // --------- Fetch User Campaigns ---------
  async function fetchUserCampaigns() {
    try {
      const res = await fetch(`https://crowdfundingbackend-1.onrender.com/api/users/usercampaigns`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const campaigns = await res.json();
      console.log(campaigns)
      campaignsContainer.innerHTML = '';

      campaigns.slice(0, 4).forEach((campaign) => {
        console.log(campaign);
        const today = new Date();
        const end = new Date(campaign.end_date);
        let daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        daysLeft = daysLeft < 0 ? "Completed" : `${daysLeft} days left`;

        const shortDesc = campaign.description.split(' ').slice(0, 10).join(' ') + '...';

        const card = document.createElement('div');
        card.classList.add('campaign-card');
        card.innerHTML = `
          <img class="camp-img" src="${campaign.images[0]}" alt="${campaign.title}" />
          <div class="campaign-content">
            <h3 class="camp-heading">${campaign.title}</h3>
            <p>${shortDesc}</p>
            <div class="progress-bar">
              <div class="progress" style="width: ${((campaign.raisedAmount) / campaign.goal_amount) * 100}%"></div>
            </div>
            <div class="campaign-stats">
              <span class="camp-money">${campaign.raisedAmount || '0'}/${campaign.goal_amount}</span>
              <span class="camp-timeleft">${daysLeft}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => {
          window.location.href = `/components/myCampaign.html?id=${campaign.campaign_id}`;
        });
        campaignsContainer.appendChild(card);
      });

      if (campaigns.length === 0) campaignsContainer.innerHTML = "<p>No Campaigns Started</p>";

    } catch (err) {
      console.error(err);
      campaignsContainer.innerHTML = "<p>No Campaigns Started</p>";
    }
  }

  // --------- Logout ---------
  async function handleLogout() {
    try {
      const res = await fetch('https://crowdfundingbackend-1.onrender.com/api/auth/logout', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert(data.message || "Logout successful");
        window.location.href = '../index.html';
      } else {
        alert(data.message || "Logout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  }

  // --------- Modal Close Handlers ---------
  closeBtn.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", (e) => { if (e.target == modal) modal.style.display = "none"; });

  // --------- Profile Edit Form Submission ---------
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("email", document.getElementById("email")?.value || "");
    formData.append("password", document.getElementById("password")?.value || "");
    formData.append("about_user", document.getElementById("bio").value);
    formData.append("location", document.getElementById("location").value);

    const profileImage = document.getElementById("profileImage")?.files[0];
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      const res = await fetch("https://crowdfundingbackend-1.onrender.com/api/users/profile", {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        modal.style.display = "none";
        fetchUserProfile();
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  });

  // --------- Initial Fetch ---------
  fetchUserProfile();
  fetchUserDonations();
  fetchUserCampaigns();
});
