import { startTokenRefresh } from './tokenManager.js';
startTokenRefresh();
const form = document.getElementById('campaignForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('camp-category').value);
    formData.append('description', document.getElementById('camp-description').value);
    formData.append('goal_amount', document.getElementById('camp-amount').value);
    formData.append('start_date', document.querySelector('input[type="date"]').value);
    formData.append('end_date', document.querySelectorAll('input[type="date"]')[1].value);
    formData.append('beneficiary_name', document.getElementById('ben-name').value);
    formData.append('beneficiary_type', document.getElementById('ben-type').value);
    formData.append('beneficiary_description', document.getElementById('ben-description').value);
    formData.append('beneficiary_address', document.getElementById('ben-location').value);

    const images = document.getElementById('camp-images').files;
    for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
    }
    const files = document.getElementById('camp-files').files;
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch('https://crowdfundingbackend-1.onrender.com/api/campaignform', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });

        const result = await res.json();
        console.log(result);

        if(res.ok){
            alert(`Campaign Created! ID: ${result.campaign_id}`);
            form.reset();
        } else {
            alert(`Error: ${result.message}`);
        }

    } catch(err) {
        alert(`Server Error: ${err.message}`);
    }
});
