<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h3>後台管理</h3>
      <nav>
        <router-link to="/">🏠 回到首頁</router-link>
        <router-link to="/admin">數據中心</router-link>
        <router-link to="/admin/users">帳號管理</router-link>
        <router-link to="/admin/cat">貓咪管理</router-link>
        <router-link to="/admin/product">商品管理</router-link>
      </nav>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #2c3e50; /* 換一個比較柔和的深藍色 */
  color: white;
  padding: 20px;
  flex-shrink: 0; /* 防止側邊欄在視窗縮小時被壓縮 */
}

.sidebar h3 {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #4a627a;
  padding-bottom: 15px;
  font-size: 1.2rem;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 按鈕之間的間距 */
}

.sidebar nav a {
  display: block;
  padding: 12px 15px;
  background: #34495e;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.2s;
}

.sidebar nav a:hover {
  background: #4e6a85;
  transform: translateX(5px);
}

.sidebar nav a.router-link-exact-active {
  background: #e67e22; /* 使用亮橘色來標示當前頁面 */
  color: #fff;
  font-weight: bold;
}

.admin-main {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
}
</style>
