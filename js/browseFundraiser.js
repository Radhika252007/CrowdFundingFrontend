const BACKEND_URL = "https://crowdfundingbackend-1.onrender.com"; 
const topContainer = document.querySelector(".project-container");
const lowerContainer = document.querySelector(".lower-project-container");
const projectContainer = document.querySelector(".project");
function showSkeletons(container, count = 6) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-bar"></div>
      <div class="skeleton-small-text"></div>
    `;
    container.appendChild(skeleton);
  }
}

function renderCampaigns(campaigns) {
  console.log(campaigns)
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
     projectContainer.innerHTML = "<h1 style='text-align : center; margin: 30px; font-size: 26px;color: #0A5251'>No campaigns found.</h1>";
    if (lowerContainer) lowerContainer.innerHTML = "";
    return;
  }

  const today = new Date();
  const filtered = campaigns.filter(
    c => c.status === "Approved"
  );
  console.log(filtered)
  const topCampaigns = filtered.slice(0, 6);
  const remainingCampaigns = filtered.slice(6);

  // Render top campaigns
  topContainer.innerHTML = "";
  topCampaigns.forEach(campaign => {
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
      window.location.href = `/components/Campaign_page.html?id=${campaign.campaign_id}`;
    });
    topContainer.appendChild(card);
  });

  // Render remaining campaigns
  if (lowerContainer) {
    lowerContainer.innerHTML = "";
    const newRemainingCampaigns = remainingCampaigns.slice(0,6);
    newRemainingCampaigns.forEach(campaign => {
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
        window.location.href = `/components/Campaign_page.html?campaign_id=${campaign.campaign_id}`;
      });
      lowerContainer.appendChild(card);
    });
  }
}

// ------------------ Fetch Campaigns ------------------
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

function fetchCategoryCampaigns(type) {
  fetch(`${BACKEND_URL}/api/campaigns/category/${encodeURIComponent(type)}`, { method: "GET", credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        renderCampaigns(data);
      } else if (data.message) {
        topContainer.innerHTML = `<p>${data.message}</p>`;
        if (lowerContainer) lowerContainer.innerHTML = "";
      } else {
        renderCampaigns([]);
      }
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

// Show skeletons while fetching category campaigns
showSkeletons(topContainer);
if (lowerContainer) showSkeletons(lowerContainer);

fetchCategoryCampaigns(category);

  });
});
// Show skeletons while fetching campaigns
showSkeletons(topContainer);
if (lowerContainer) showSkeletons(lowerContainer);

fetchAllCampaigns();
