const BACKEND_URL = "https://crowdfundingbackend-1.onrender.com";
const topContainer = document.querySelector(".project-container");
const lowerContainer = document.querySelector(".lower-project-container");

function renderCampaigns(campaigns) {

  topContainer.innerHTML = "";
  if (lowerContainer) lowerContainer.innerHTML = "";

  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    topContainer.innerHTML = "<h1 style='text-align:center; margin:30px; font-size:26px; color:#0A5251'>No campaigns found.</h1>";
    return;
  }

  const filtered = campaigns.filter(c => c.status?.trim().toLowerCase() === "approved");

  if (filtered.length === 0) {
    topContainer.
    topContainer.innerHTML = "<h1 style='text-align:center; margin:30px; font-size:26px; color:#0A5251'>No campaigns found.</h1>";
    return;
  }

  const topCampaigns = filtered.slice(0, 6);
  const remainingCampaigns = filtered.slice(6);

  function createCard(campaign) {
    const barFilled = (campaign.raised_amount / campaign.goal_amount) * 100;
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <img src="${campaign.images?.[0] || "/assets/default.jpg"}" class="project-img" alt="campaign image" />
      <p class="project-text">${campaign.title}</p>
      <div class="fund-details">
        <p><strong>${campaign.raised_amount}</strong> raised of ${campaign.goal_amount}</p>
        <div class="fund-bar">
          <div class="fund-bar-fill" style="width: ${barFilled}%;"></div>
        </div>
        <p class="donor-count">${campaign.noOfDonations} people have donated</p>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `/components/campaign_page.html?id=${campaign.campaign_id}`;
    });
    return card;
  }

  topCampaigns.forEach(campaign => {
    const card = createCard(campaign);
    topContainer.appendChild(card);
  });

  // Render remaining campaigns
  if (lowerContainer) {
    remainingCampaigns.slice(0, 6).forEach(campaign => {
      const card = createCard(campaign);
      lowerContainer.appendChild(card);
    });
  }
}

// ------------------ Fetch All Campaigns ------------------
function fetchAllCampaigns() {
  fetch(`${BACKEND_URL}/api/campaigns`, { method: "GET", credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const campaigns = Array.isArray(data) ? data : [];
      renderCampaigns(campaigns);
    })
    .catch(err => {
      console.error("Error fetching campaigns:", err);
      topContainer.innerHTML = "<p>Failed to load campaigns. Please try again later.</p>";
      if (lowerContainer) lowerContainer.innerHTML = "";
    });
}

// ------------------ Fetch Category Campaigns ------------------
function fetchCategoryCampaigns(category) {
  fetch(`${BACKEND_URL}/api/campaigns/category/${encodeURIComponent(category)}`, { method: "GET", credentials: "include" })
    .then(res => res.json())
    .then(data => {
      let campaigns = [];
      if (Array.isArray(data)) {
        campaigns = data;
      } else if (data.campaigns && Array.isArray(data.campaigns)) {
        campaigns = data.campaigns;
      }
      renderCampaigns(campaigns);
    })
    .catch(err => {
      console.error("Error fetching category campaigns:", err);
      topContainer.innerHTML = "<p>Failed to load campaigns. Please try again later.</p>";
      if (lowerContainer) lowerContainer.innerHTML = "";
    });
}

// ------------------ Category Click Events ------------------
const categoryDivs = document.querySelectorAll(".category-box .sub");
categoryDivs.forEach(div => {
  div.addEventListener("click", () => {
    categoryDivs.forEach(d => d.classList.remove("active-category"));
    div.classList.add("active-category");

    const category = div.querySelector("p").textContent.trim();
    fetchCategoryCampaigns(category);
  });
});

// ------------------ Initial Load ------------------
fetchAllCampaigns();
