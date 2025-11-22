const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.log-btn');
const emailInput = document.getElementById('email');
const user_pass = document.getElementById('password');
if(!localStorage.getItem("active")){
localStorage.setItem("active","login");
}
let activeRegion = localStorage.getItem("active");
window.onload = function (){
    if(activeRegion==="register"){
        container.classList.add('active');
    }
    else if(activeRegion==="login"){
        container.classList.remove('active');
    }
}

registerBtn.addEventListener("click", () => {
    container.classList.add('active');
    activeRegion = "register";
    localStorage.setItem("active",activeRegion);
});

loginBtn.addEventListener("click", () => {
    container.classList.remove('active');
    activeRegion = "login";
    localStorage.setItem("active",activeRegion);
});

const loginForm = document.querySelector('.login form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();  
    checkCredentials();   
});
function checkCredentials(){
    const email = emailInput.value.trim();
    const password = user_pass.value.trim();
fetch('https://crowdfundingbackend-1.onrender.com/api/auth/login',{
    method : 'POST',
    headers : {'Content-Type' : 'application/json'},
    body : JSON.stringify({email,password})
})
.then(async res=>{
    console.log(res.status+" "+res.headers);
    const data  = await res.json();
    if(res.ok && data.message ==='Login Successful'){
        localStorage.setItem('accessToken',data.accessToken);
        localStorage.setItem('refreshToken',data.refreshToken);
        alert('Login Successfull');
        window.location.href = '/components/UserProfile.html';
    }
    else{
        alert("Wrong Login Credentials");
    }

})
.catch(err=>{
    console.log("Error occured: ",err);
    alert('Something went wrong');
})
}

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const circles = document.querySelectorAll(".step-circle");
  let current = 0;

  function showStep(index) {
    steps.forEach((step, i) => step.classList.toggle("hidden", i !== index));
    circles.forEach((circle, i) => {
      circle.classList.toggle("bg-blue-500", i === index);
      circle.classList.toggle("text-white", i === index);
      circle.classList.toggle("bg-gray-100", i !== index);
    });
  }

  document.querySelectorAll(".next-step").forEach(btn =>
    btn.addEventListener("click", () => {
      if (current < steps.length - 1) {
        current++;
        showStep(current);
      }
    })
  );

  document.querySelectorAll(".prev-step").forEach(btn =>
    btn.addEventListener("click", () => {
      if (current > 0) {
        current--;
        showStep(current);
      }
    })
  );

  showStep(current);
});


const registerForm = document.querySelector(".register form")
registerForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    registrationForm();
})

async function registrationForm(){
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const dob = document.getElementById("dob").value;
    const about = document.getElementById("about").value.trim();
    const profileImage = document.getElementById("profile-image").files[0];
    const location = document.getElementById("location").value.trim();

    if(password!=confirmPassword){
        alert("Password do not match");
        return;
    }

    const formData = new FormData();
    formData.append("name", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("dob", dob);
    formData.append("about_user", about);
    formData.append("location",location);
    if (profileImage) formData.append("profileImage", profileImage);
    try{
        const response = await fetch('https://crowdfundingbackend-1.onrender.com/api/auth/register',{
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if(response.ok){
            alert("Registration Successfully Done");
            localStorage.setItem("accessToken", result.accessToken);
            localStorage.setItem("refreshToken",result.refreshToken);
            window.location.href = '/index.html';
        }
        else{
            alert("Registration Failed");
        }

    }
    catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }
}