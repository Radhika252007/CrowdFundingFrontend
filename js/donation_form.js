const paymentBoxes = {
  card: document.getElementById('cardBox'),
  upi: document.getElementById('upiBox'),
  netbanking: document.getElementById('netbankingBox'),
  wallet: document.getElementById('walletBox')
};

const paymentSelect = document.getElementById('payment');
paymentSelect.addEventListener("change", () => {
  Object.values(paymentBoxes).forEach(box => box.style.display = 'none');
  const selectedBox = paymentBoxes[paymentSelect.value];
  if (selectedBox) selectedBox.style.display = 'block';
});

const params = new URLSearchParams(window.location.search);
const campaign_id = params.get("campaign_id");
const form = document.getElementById('donationForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!campaign_id) {
    alert("Invalid campaign link.");
    return;
  }

  const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phoneNo: document.getElementById('phone').value.trim(),
    donationAmount: Number(document.getElementById('amount').value),
    paymentMethod: document.getElementById('payment').value
  };

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`https://crowdfundingbackend-1.onrender.com/api/donation/${campaign_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log(result);

    if (res.ok) {
      alert("Donation made successfully!");
      form.reset();
      Object.values(paymentBoxes).forEach(box => box.style.display = 'none');
    } else {
      alert(`Error: ${result.err || result.message}`);
    }
  } catch (err) {
    console.error(err);
    alert(`Server Error: ${err.message || err}`);
  } finally {
    submitBtn.disabled = false;
  }
});
