 const fundraiser = document.querySelector('.start-fundraiser');
      const donate = document.querySelectorAll('#donation');
      const observer = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        })
      });
      const observer2 = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        })
      });
      donate.forEach(don=>
        observer2.observe(don)
      )
      observer.observe(fundraiser);