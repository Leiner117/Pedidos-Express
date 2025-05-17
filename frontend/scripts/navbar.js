export function loadNavbar(targetId = "navbar") {
    fetch("../components/navbar.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById(targetId).innerHTML = html;
  
        const title = document.getElementById("site-title");
        if (title) {
          title.onclick = () => location.href = "../index.html";
        }
      })
      .catch(err => {
        console.error("Error al cargar navbar:", err);
      });
  }
  