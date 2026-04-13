import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import Products from "views/Products.js";
import Categories from "views/Categories.js";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/products",
    name: "Ürünler",
    icon: "nc-icon nc-cart-simple",
    component: Products,
    layout: "/admin"
  },
  {
    path: "/categories",
    name: "Kategoriler",
    icon: "nc-icon nc-tag-content",
    component: Categories,
    layout: "/admin"
  },
  {
    path: "/user",
    name: "Kullanıcı Profili",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/admin"
  },
];

export default dashboardRoutes;
