function showCampaignForm(){
    const accessToken = localStorage.getItem("accessToken");
    if(!accessToken){
      alert("Please Login to Start a Campaign");
      return;
    }
    window.location.href = "/components/FundraiserForm.html";
  }
// Modal HTML with icons and styling
const modalHTML = `
<div id="contactModal" style="display:none;position:fixed;z-index:1000;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.6);justify-content:center;align-items:center;font-family:Poppins,sans-serif;">
  <div style="background:#fff;margin:auto;padding:25px 30px;border-radius:12px;width:90%;max-width:400px;text-align:center;position:relative;box-shadow:0 10px 25px rgba(0,0,0,0.3);">
    <span id="closeModal" style="position:absolute;top:10px;right:15px;font-size:26px;font-weight:bold;cursor:pointer;color:#333;">&times;</span>
    <h2 style="margin-bottom:15px;color:#0A5251;">Contact Us</h2>
    <div style="text-align:left;display:flex;flex-direction:column;gap:12px;font-size:16px;color:#333;">
      <p><i class="fas fa-envelope" style="color:#0A5251;margin-right:8px;"></i>Email: <a href="mailto:info@brightpath.com" style="color:#0A5251;text-decoration:none;">info@brightpath.com</a></p>
      <p><i class="fas fa-phone" style="color:#0A5251;margin-right:8px;"></i>Phone: <a href="tel:0123456789" style="color:#0A5251;text-decoration:none;">0123456789</a></p>
      <p><i class="fab fa-instagram" style="color:#E1306C;margin-right:8px;"></i>Instagram: <a href="https://instagram.com/brightpath" target="_blank" style="color:#E1306C;text-decoration:none;">@brightpath</a></p>
      <p><i class="fab fa-facebook" style="color:#1877F2;margin-right:8px;"></i>Facebook: <a href="https://facebook.com/brightpath" target="_blank" style="color:#1877F2;text-decoration:none;">BrightPath</a></p>
      <p><i class="fab fa-twitter" style="color:#1DA1F2;margin-right:8px;"></i>Twitter: <a href="https://twitter.com/brightpath" target="_blank" style="color:#1DA1F2;text-decoration:none;">@brightpath</a></p>
    </div>
  </div>
</div>
`;

// Append modal to body
document.body.insertAdjacentHTML('beforeend', modalHTML);

// Function to attach modal events to all "Contact" links
function enableContactModal() {
  const modal = document.getElementById('contactModal');
  const closeBtn = document.getElementById('closeModal');

  document.querySelectorAll('a').forEach(link => {
    if(link.textContent.trim().toLowerCase() === 'contact') {
      link.addEventListener('click', e => {
        e.preventDefault();
        modal.style.display = 'flex';
      });
    }
  });

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = e => { if(e.target === modal) modal.style.display = 'none'; };
}

// Initialize modal
enableContactModal();
