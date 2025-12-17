const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuBtnIcon = document.querySelector(".menu-btn i");
const databaseTables = document.getElementById("database-tables");

// Single database name
//const currentDatabase = "my_database";

// Example tables for the database
const tables = [
  "users",
  "products", 
  "orders",
  "categories",
  "logs"
];

// Populate database tables submenu
tables.forEach(table => {
  const li = document.createElement("li");
  li.className = "submenu-item";
  
  li.innerHTML = `<i class="fa-solid fa-table" style="width:16px;text-align:center;margin-right:6px;"></i> ${table}`;
  
  li.addEventListener("click", (e) => {
    e.stopPropagation();
    alert(`Loading table: ${table}`);
    if (window.innerWidth < 768) closeSidebar();
  });
  
  databaseTables.appendChild(li);
});

const settingsSubmenu = document.getElementById("settings-submenu");

// Example list of settings
const settings = ["Profile Settings", "Security", "Notifications", "Appearance"];

// Populate Settings submenu
settings.forEach(setting => {
  const li = document.createElement("li");
  li.className = "submenu-item";
  
  li.innerHTML = `<i class="fa-solid fa-sliders" style="width:16px;text-align:center;margin-right:6px;"></i> ${setting}`;
  
  li.addEventListener("click", (e) => {
    e.stopPropagation();
    alert(`Navigating to: ${setting}`);
    if (window.innerWidth < 768) closeSidebar();
  });
  
  settingsSubmenu.appendChild(li);
});

// Submenu functionality (same as before)
document.querySelectorAll('.has-submenu').forEach(item => {
  const header = item.querySelector('.menu-item-header');
  const submenu = item.querySelector('.submenu');
  
  header.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Close other open submenus
    document.querySelectorAll('.has-submenu').forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
        otherItem.querySelector('.submenu').classList.remove('open');
      }
    });
    
    // Toggle current submenu
    item.classList.toggle('active');
    submenu.classList.toggle('open');
  });
});

// Close submenus when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.has-submenu')) {
    document.querySelectorAll('.has-submenu').forEach(item => {
      item.classList.remove('active');
      item.querySelector('.submenu').classList.remove('open');
    });
  }
});

// Main menu item click handler (non-submenu items)
document.querySelectorAll('.menu-item:not(.has-submenu) .menu-item-header').forEach(header => {
  header.addEventListener('click', (e) => {
    const text = header.querySelector('span').textContent.trim();
    alert(`Navigating to: ${text}`);
    if (window.innerWidth < 768) closeSidebar();
  });
});

// Sidebar toggle functions (same as before)
function toggleSidebar(btn) {
  if (sidebar.style.left === "0px") {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  sidebar.style.left = "0";
  overlay.style.display = "block";
  menuBtnIcon.classList.remove("fa-bars");
  menuBtnIcon.classList.add("fa-xmark");
}

function closeSidebar() {
  sidebar.style.left = "-250px";
  overlay.style.display = "none";
  menuBtnIcon.classList.remove("fa-xmark");
  menuBtnIcon.classList.add("fa-bars");
  
  // Close all submenus when sidebar closes
  document.querySelectorAll('.has-submenu').forEach(item => {
    item.classList.remove('active');
    item.querySelector('.submenu').classList.remove('open');
  });
}

// Close sidebar when clicking overlay or close button
overlay.addEventListener("click", closeSidebar);
document.querySelector(".close-btn").addEventListener("click", closeSidebar);

// Login/logout functionality (same)
const loginBtn = document.querySelector('.login-btn');
const logoutBtn = document.querySelector('.logout-btn');

loginBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  loginBtn.style.display = 'none';
  logoutBtn.style.display = 'flex';
  document.querySelector('.sidebar-user .username').textContent = 'Logged In';
  document.querySelector('.sidebar-user .role').textContent = 'Administrator';
  alert('Login successful! (Demo)');
});

logoutBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  logoutBtn.style.display = 'none';
  loginBtn.style.display = 'flex';
  document.querySelector('.sidebar-user .username').textContent = 'Guest';
  document.querySelector('.sidebar-user .role').textContent = 'Visitor';
  alert('Logged out! (Demo)');
});

// Keyboard shortcuts - simplified
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();

  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    const databaseMenu = document.getElementById('database-item');
    databaseMenu.classList.add('active');
    databaseMenu.querySelector('.submenu').classList.add('open');
  }

  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    const settingsMenu = document.getElementById('settings-item');
    settingsMenu.classList.add('active');
    settingsMenu.querySelector('.submenu').classList.add('open');
  }
});

// Close submenus on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth < 768) {
    document.querySelectorAll('.has-submenu').forEach(item => {
      item.classList.remove('active');
      item.querySelector('.submenu').classList.remove('open');
    });
  }
});