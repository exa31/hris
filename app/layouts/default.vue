<template>
  <div class="app-layout">
    <!-- Sidebar Overlay for Mobile -->
    <div class="sidebar-overlay" @click="sidebarCollapsed = true"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo-section">
          <i class="bi bi-building"></i>
          <span class="logo-text">JMC</span>
        </div>
        <button class="btn-collapse" @click="sidebarCollapsed = !sidebarCollapsed">
          <i class="bi bi-chevron-left"></i>
        </button>
      </div>

        <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">MENU UTAMA</div>
          <NuxtLink 
            to="/dashboard" 
            class="nav-item" 
            :class="{ active: isActive('/dashboard') }"
          >
            <i class="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NuxtLink>
          <NuxtLink 
            v-if="hasPermission('employees', 'read')"
            to="/employees" 
            class="nav-item" 
            :class="{ active: isActive('/employees') }"
          >
            <i class="bi bi-people"></i>
            <span>Data Pegawai</span>
          </NuxtLink>
        </div>

        <!-- Menu Manajemen Data -->
        <div class="nav-section" v-if="hasPermission('transport', 'read')">
          <div class="nav-section-title">MANAJEMEN DATA</div>
          <NuxtLink 
            to="/transport-allowance" 
            class="nav-item" 
            :class="{ active: isActive('/transport-allowance') }"
          >
            <i class="bi bi-truck"></i>
            <span>Tunjangan Transport</span>
          </NuxtLink>
        </div>

        <!-- Menu Administrasi -->
        <div class="nav-section" v-if="hasPermission('users', 'read') || hasPermission('roles', 'read') || hasPermission('logs', 'read') || hasPermission('transport_setting', 'read')">
          <div class="nav-section-title">ADMINISTRASI</div>
          <NuxtLink 
            v-if="hasPermission('users', 'read')"
            to="/user-management" 
            class="nav-item" 
            :class="{ active: isActive('/user-management') }"
          >
            <i class="bi bi-person-gear"></i>
            <span>Manajemen User</span>
          </NuxtLink>
          <NuxtLink 
            v-if="hasPermission('roles', 'read')"
            to="/roles" 
            class="nav-item" 
            :class="{ active: isActive('/roles') }"
          >
            <i class="bi bi-shield-lock"></i>
            <span>Kelola Role</span>
          </NuxtLink>
          <NuxtLink 
            v-if="hasPermission('logs', 'read')"
            to="/activity-logs" 
            class="nav-item" 
            :class="{ active: isActive('/activity-logs') }"
          >
            <i class="bi bi-clock-history"></i>
            <span>Log Aktivitas</span>
          </NuxtLink>
          <NuxtLink 
            v-if="hasPermission('transport_setting', 'read')"
            to="/settings/transport-settings" 
            class="nav-item" 
            :class="{ active: isActive('/settings/transport-settings') }"
          >
            <i class="bi bi-gear"></i>
            <span>Pengaturan Tunjangan</span>
          </NuxtLink>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-container">
      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <button class="btn-menu" @click="sidebarCollapsed = !sidebarCollapsed">
            <i class="bi bi-list"></i>
          </button>
        </div>

        <div class="header-right">
          <div class="user-profile">
            <div class="user-avatar">
              {{ userInitial }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ userName }}</div>
              <div class="user-role">{{ userRole }}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="app-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sidebarCollapsed = ref(false);

const { user, hasPermission } = useAuth();

const userName = computed(() => user.value?.employee?.name || 'User');
const userRole = computed(() => user.value?.role?.name || '');
const userInitial = computed(() => {
  const name = user.value?.employee?.name || 'U';
  return name.charAt(0).toUpperCase();
});

const isActive = (path: string) => {
  return router.currentRoute.value.path.startsWith(path);
};

const handleLogout = async () => {
  const { logout } = useAuth();
  await logout();
};
</script>

<style scoped>
:root {
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 80px;
  --header-height: 70px;
  --primary-color: #667eea;
  --primary-light: #7c8ef4;
  --sidebar-bg: #1e293b;
  --sidebar-hover: #334155;
  --text-light: #ecf0f1;
  --border-color: #bdc3c7;
  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-layout {
  display: flex;
  height: 100vh;
  background: #f1f5f9;
  overflow: hidden;
  flex-wrap: nowrap;
}

/* === SIDEBAR === */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  color: #334155;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 25px rgba(0, 0, 0, 0.08);
  z-index: 100;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
}

/* Sidebar Toggle Overlay for Mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  backdrop-filter: blur(2px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

.sidebar.sidebar-collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, transparent 100%);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: bold;
  flex: 1;
  min-width: 0;
}

.logo-section i {
  font-size: 1.75rem;
  animation: logoFloat 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  color: var(--primary-light);
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
}

.sidebar.sidebar-collapsed .logo-section i {
  display: none;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px) rotateZ(0deg);
  }
  50% {
    transform: translateY(-5px) rotateZ(5deg);
  }
}

.logo-text {
  white-space: nowrap;
  background: linear-gradient(135deg, #7c8ef4, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  transition: opacity 0.2s ease, width 0.3s ease;
  overflow: hidden;
  width: 60px;
  opacity: 1;
}

.sidebar.sidebar-collapsed .logo-text {
  width: 0;
  opacity: 0;
}

.btn-collapse {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #334155;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-collapse:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
  color: #667eea;
}

.btn-collapse i {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.sidebar-collapsed .btn-collapse i {
  transform: rotate(180deg);
}

.btn-collapse:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
  color: #667eea;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Hide scrollbar for sidebar nav */
.sidebar-nav::-webkit-scrollbar {
  display: none;
}
.sidebar-nav {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.nav-section {
  position: relative;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.nav-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1.5rem;
  right: 1.5rem;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.sidebar.sidebar-collapsed .nav-section::after {
  left: 1rem;
  right: 1rem;
}

.nav-section:last-child::after {
  display: none;
}

.nav-section-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  padding: 0 1.5rem;
  margin-bottom: 0.75rem;
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  white-space: nowrap;
  transition: all 0.3s ease;
  min-width: 1.5rem;
  opacity: 1;
  overflow: hidden;
}

.sidebar.sidebar-collapsed .nav-section-title {
  display: none;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  color: #64748b;
  text-decoration: none;
  cursor: pointer;
  border-left: 3px solid transparent;
  margin: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  position: relative;
  justify-content: flex-start;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 0.85rem 0.5rem;
}

.sidebar.sidebar-collapsed .nav-item i {
  margin-right: 0;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 4px;
  background: var(--primary-color);
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transform: scaleY(0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  color: #1e293b;
  background: rgba(102, 126, 234, 0.08);
}

.nav-item:hover i {
  color: var(--primary-light);
  transform: scale(1.1);
}

.nav-item.active {
  color: #667eea;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.12) 0%, transparent 100%);
}

.nav-item.active i {
  color: var(--primary-color);
  filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.4));
}

.nav-item.active::before {
  opacity: 1;
  transform: scaleY(1);
}

.nav-item span {
  transition: opacity 0.3s ease, width 0.3s ease, margin 0.3s ease;
  opacity: 1;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.sidebar-collapsed .nav-item span {
  opacity: 0;
  width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: none;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: auto;
}

.logout-btn {
  width: 100%;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid transparent;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.sidebar.sidebar-collapsed .logout-btn {
  padding: 0.8rem 0.5rem;
  justify-content: center;
}

.sidebar.sidebar-collapsed .logout-btn:hover span {
  opacity: 0;
  width: 0;
  display: none;
}

.logout-btn i {
  color: #ef4444;
  transition: transform 0.3s ease;
  min-width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.logout-btn:hover i {
  transform: scale(1.1);
}

/* === MAIN CONTAINER === */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e0ea 100%);
  border-radius: 20px 0 0 0;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
}

/* === HEADER === */
.app-header {
  height: var(--header-height);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.btn-menu {
  background: transparent;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  font-size: 1.25rem;
  color: #64748b;
  transition: all 0.2s ease;
  display: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  align-items: center;
  justify-content: center;
}

.btn-menu:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.user-profile:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #7c8ef4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* === CONTENT === */
.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
  background: #f8fafc;
}

/* Custom Scrollbar for Content */
.app-content::-webkit-scrollbar {
  width: 6px;
}
.app-content::-webkit-scrollbar-track {
  background: transparent;
}
.app-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.app-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.sidebar-collapsed {
    width: var(--sidebar-width-collapsed);
    transform: translateX(-100%);
  }

  .sidebar:not(.sidebar-collapsed) {
    transform: translateX(0);
    box-shadow: 4px 0 25px rgba(0, 0, 0, 0.3);
  }

  /* Show overlay when sidebar is open on mobile */
  .sidebar:not(.sidebar-collapsed) ~ .sidebar-overlay {
    display: block;
    opacity: 1;
  }

  .btn-menu {
    display: flex !important;
  }
  
  .btn-collapse {
    display: none; /* Hide toggle from inside sidebar on mobile */
  }

  .app-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 1rem;
  }

  .user-info {
    display: none;
  }

  .user-profile {
    padding: 0.4rem;
    border-radius: 50%;
  }

  .app-content {    
    padding: 1rem;
  }
}

@media (min-width: 769px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: none !important;
  }

  .btn-menu {
    display: none !important;
  }
}
</style>        
