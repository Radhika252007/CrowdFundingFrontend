const answers = document.querySelectorAll(".faqs");
answers.forEach((answer) => {
  answer.addEventListener("click", () => {
    answer.classList.toggle("open");
  });
});

const images = document.querySelectorAll('.inner');
const outer_images = document.querySelectorAll('.outer');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

images.forEach(img => observer.observe(img));
outer_images.forEach(img => observer.observe(img));


const dropdownBtn = document.getElementById("login-btn");
const dropdownMenu = document.getElementById("content");

dropdownBtn.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

window.addEventListener("click", (e) => {
  if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.add("hidden");
  }
});

fetch("https://crowdfundingbackend-1.onrender.com/api/campaigns", {
  method: 'GET',
  credentials: "include"
})
  .then((response) => response.json())
  .then((data) => {

    const today = new Date();
    const filtered = data.filter(
      (campaign) => new Date(campaign.end_date) > today && campaign.status === "Approved"
    );

    const urgentContainer = document.getElementById("urgent-cards");
    urgentContainer.innerHTML = ""; 

    if (filtered.length === 0) {
      urgentContainer.innerHTML = `
        <p style="text-align:center; font-size:18px;">No active campaigns available.</p>
      `;
      return;
    }

    filtered.slice(0, 4).forEach((campaign) => {
      const card = document.createElement("div");
      card.classList.add("urgent-funds");

      const imgSrc = campaign.images[0];
      const percent = (campaign.raised_amount / campaign.goal_amount) * 100;

      const end = new Date(campaign.end_date);
      const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

      card.innerHTML = `
        <img src="${imgSrc}" alt="" class="fund-img">
        <section class="fund-info">
          <div class="fund-text">
            <p class="fund-organizer">${campaign.organizer || ""}</p>
            <h4 class="fund-name">${campaign.title}</h4>
          </div>

          <div class="fund-bar">
            <div class="fund-bar-fill" style="width:${percent}%"></div>
          </div>

          <div class="amount">
            <span class="fund-money">₹${campaign.raised_amount}/₹${campaign.goal_amount}</span>
            <span class="fund-timeleft">${daysLeft} days left</span>
          </div>
        </section>
      `;
      card.addEventListener("click", () => {
        window.location.href = `/components/Campaign_page.html?id=${campaign.campaign_id}`;
      });

      urgentContainer.appendChild(card);
    });
  })
  .catch((err) => console.error(err));

  function showCampaignForm(){
    const accessToken = localStorage.getItem("accessToken");
    if(!accessToken){
      alert("Please Login to Start a Campaign");
      return;
    }
    window.location.href = "/components/FundraiserForm.html";
  }
