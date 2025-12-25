import { startTokenRefresh } from './tokenManager.js';
startTokenRefresh();

let allImages = [];   // max 5
let allFiles = [];    // max 3

const form = document.getElementById('campaignForm');

/* ------------------------------
   HANDLE IMAGES (max 5)
--------------------------------*/
const imageInput = document.getElementById('camp-images');

imageInput.addEventListener("change", () => {
    for (let file of imageInput.files) {
        if (allImages.length < 5) {
            allImages.push(file);
        } else {
            alert("You can upload a maximum of 5 images.");
            break;
        }
    }
    console.log("Images =", allImages.length, allImages);
});

/* ------------------------------
   HANDLE FILES (max 3)
--------------------------------*/
const fileInput = document.getElementById('camp-files');

fileInput.addEventListener("change", () => {
    for (let file of fileInput.files) {
        if (allFiles.length < 2) {
            allFiles.push(file);
        } else {
            alert("You can upload a maximum of 2 files.");
            break;
        }
    }
    console.log("Files =", allFiles.length, allFiles);
});


/* ------------------------------
   FORM SUBMIT
--------------------------------*/
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

    // Validate max limits before sending
    if (allImages.length > 5) {
        alert("Max 5 images allowed.");
        return;
    }
    if (allFiles.length > 2) {
        alert("Max 3 files allowed.");
        return;
    }

    // Append images
    for (let img of allImages) {
        formData.append("images", img);
    }

    // Append files
    for (let f of allFiles) {
        formData.append("files", f);
    }

    try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch('https://crowdfundingbackend-1.onrender.com/api/campaignform', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const result = await res.json();
        console.log(result);

        if (res.ok) {
            alert(`Campaign Created! ID: ${result.campaign_id}`);
            form.reset();
            allImages = [];
            allFiles = [];
        } else {
            alert(`Error: ${result.message}`);
        }

    } catch (err) {
        alert(`Server Error: ${err.message}`);
    }
});
