const BACKEND_URL = "https://crowdfundingbackend-1.onrender.com"
const about = document.getElementById("about");
const update = document.getElementById("update");
const update_btn = document.getElementById("update-btn");
const about_btn = document.getElementById("about-btn");

window.onload = function () {
  const section = localStorage.getItem("activeSection") || "about";
  toggleSections(section);
};

function toggleSections(section) {
  if (section === "about") {
    update.style.display = "none";
    about.style.display = "block";

    about_btn.style.color = "#0A5251";
    about_btn.style.fontWeight = "bold";
    update_btn.style.color = "#4d4d4d";
    update_btn.style.fontWeight = "500";
  } else {
    about.style.display = "none";
    update.style.display = "block";

    update_btn.style.color = "#0A5251";
    update_btn.style.fontWeight = "bold";
    about_btn.style.color = "#4d4d4d";
    about_btn.style.fontWeight = "500";
  }

  localStorage.setItem("activeSection", section);
}


const main_image = document.getElementById("main-image");

function activateThumbnailClick() {
  const camp_images = document.querySelectorAll(".camp-images");

  camp_images.forEach((img) => {
    img.addEventListener("click", () => {
      main_image.style.backgroundImage = `url('${img.src}')`;
      main_image.style.backgroundPosition = "center";
      main_image.style.backgroundSize = "cover";
    });
  });
}


const params = new URLSearchParams(window.location.search);
const campaign_id = params.get("id");


if (!campaign_id) {
  document.querySelector("main").innerHTML = "<h1>Invalid Campaign</h1>";
  throw new Error("Campaign ID not found in URL");
}

document.getElementById("donationBtn").addEventListener("click", () => {
  window.location.href = `/components/Donation_Form.html?campaign_id=${campaign_id}`;
});

async function loadCampaign(campaign_id) {
  try {
    // Campaign
    const campaignRes = await fetch(`https://crowdfundingbackend-1.onrender.com/api/campaigns/${campaign_id}`);
    const campaign = await campaignRes.json();

    // Campaigner
    const campaignerRes = await fetch(`https://crowdfundingbackend-1.onrender.com/api/campaigns/${campaign_id}/campaigner`);
    const campaigner = await campaignerRes.json();
    console.log(campaigner)

    // Beneficiary
    const beneficiaryRes = await fetch(`https://crowdfundingbackend-1.onrender.com/api/campaigns/${campaign_id}/beneficiary`);
    const beneficiary = await beneficiaryRes.json();

    if (campaign.error) {
      document.querySelector("main").innerHTML = "<h1>Campaign Not Found</h1>";
      return;
    }

    document.querySelector(".campaign-heading").textContent = campaign.title;

    main_image.style.backgroundImage = `url('${campaign.images?.[0] || "/assets/default.jpg"}')`;

    document.querySelector(".campaign-desc").textContent = campaign.description;

    // Campaigner info
    document.querySelector(".post-id").textContent = campaigner.name;

    // Donations
    document.querySelector(".amount-collected").textContent = `₹${campaign.raised_amount}`;
    document.querySelector(".goal").textContent = `₹${campaign.goal_amount}`;

    // Progress bar
    document.querySelector(".fund-bar-fill").style.width =
      `${(campaign.raised_amount / campaign.goal_amount) * 100}%`;

    // Days left
    const today = new Date();
    const end = new Date(campaign.end_date);
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    document.querySelector(".time").innerHTML = `${daysLeft} <span>days left</span>`;

    // Campaigner section
    document.querySelector(".campaigner").innerHTML = `
 <div class="raiser-logo person-logo">
                <img
                  src="${campaigner.user_image}"
                  alt=""
                />
              </div>
              <div class="raiser-detail person-data">
                <span>Campaigner</span>
                <p>
                  <span class="person-name" id="campaignerName">${campaigner.name}</span>
                </p>
              </div>
              <button class="contact-btn">Contact</button>
    `;

    // NGO Section
    document.querySelector(".beneficier-detail").innerHTML = `
      <span>Benefiting NGO</span>
      <p><span class="person-name">${beneficiary.beneficiary_name || "N/A"}</span></p>
    `;

    /* ------------------------------------------
        LOAD UPDATES
    --------------------------------------------*/
    const updatesRes = await fetch(`https://crowdfundingbackend-1.onrender.com/api/updates/${campaign_id}`);
    const updates = await updatesRes.json();

    const updatesContainer = document.getElementById("update");
    updatesContainer.innerHTML = "";

    if (updates.message) {
      updatesContainer.innerHTML = `<h3>${updates.message}</h3>`;
    } else {
      updates.forEach((u) => {
        const updateElement = document.createElement("div");
        updateElement.classList.add("update-box");

        updateElement.innerHTML = `
          <h2>Last Updated: ${new Date(u.created_at).toLocaleDateString()}</h2>
          <div class="post-info">
            <div class="post-img">
              <img src="${campaigner.user_image || "/assets/default-user.jpg"}" />
            </div>
            <div class="post-id">${campaigner.name}</div>
          </div>
          <article>${u.update_text}</article>
        `;

        updatesContainer.appendChild(updateElement);
      });
    }

    /* ------------------------------------------
        LOAD THUMBNAIL IMAGES
    --------------------------------------------*/
    const thumbs = document.querySelector(".all-images");
    thumbs.innerHTML = "";

    campaign.images.forEach((img) => {
      thumbs.innerHTML += `<img class="camp-images" src="${img}">`;
    });

    // Activate click-to-preview
    activateThumbnailClick();

  } catch (err) {
    console.error("Error loading campaign:", err);
    document.querySelector("main").innerHTML = "<h1>Something went wrong</h1>";
  }
}
const token = localStorage.getItem('accessToken')
async function loadComments() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/campaigns/${campaign_id}/comments`);
    const comments = await res.json();

    const commentList = document.getElementById('commentsList');
    commentList.innerHTML = '';
    comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = `<b>${c.user_name || 'User'}:</b> ${c.comment_text} <span class="date">(${new Date(c.comment_date).toLocaleString()})</span>`;
      commentList.appendChild(div);
    });
  } catch (err) {
    console.error('Error loading comments:', err);
  }
}
loadComments();

// ------------------- POST COMMENT -------------------
document.getElementById('submitComment').addEventListener('click', async () => {
  const commentText = document.getElementById('commentText').value.trim();
  if (!commentText) return alert('Comment cannot be empty');
  if (!token) return alert('You must be logged in to comment');

  try {
    const res = await fetch(`${BACKEND_URL}/api/campaigns/${campaign_id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment_text: commentText })
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById('commentText').value = '';
      loadComments(); // refresh comments
    } else {
      alert(data.message || 'Error posting comment');
    }
  } catch (err) {
    console.error(err);
    alert('Server error');
  }
});

// ------------------- SHARE BUTTONS -------------------
document.querySelector('.facebook-btn').addEventListener('click', async () => {
  if (!token) return alert('You must be logged in to share');

  try {
    await fetch(`${BACKEND_URL}/api/campaigns/${campaign_id}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ share_platform: 'Facebook' })
    });
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(fbUrl, '_blank');
  } catch (err) {
    console.error(err);
    alert('Error sharing');
  }
});

document.querySelector('.whatsapp-btn').addEventListener('click', async () => {
  if (!token) return alert('You must be logged in to share');

  try {
    await fetch(`${BACKEND_URL}/api/campaigns/${campaign_id}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ share_platform: 'Whatsapp' })
    });
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`;
    window.open(waUrl, '_blank');
  } catch (err) {
    console.error(err);
    alert('Error sharing');
  }
});

document.querySelector('.forward-btn').addEventListener('click', () => {
  const modal = document.getElementById('shareModal');
  modal.style.display = 'block';
  document.getElementById('shareLink').value = window.location.href;
});

document.getElementById('closeShareModal').addEventListener('click', () => {
  document.getElementById('shareModal').style.display = 'none';
});

document.getElementById('copyLink').addEventListener('click', () => {
  const link = document.getElementById('shareLink');
  link.select();
  document.execCommand('copy');
  alert('Link copied!');
});

loadCampaign(campaign_id);

