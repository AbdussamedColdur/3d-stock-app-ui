import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";
import StoreFront from "views/StoreFront.js";
import ProductDetail from "views/ProductDetail.js";
import Login from "views/Login.js";
import MyOrders from "views/MyOrders.js";
import Register from "views/Register.js";
import PrivateRoute from "components/Auth/PrivateRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <PrivateRoute path="/admin" component={AdminLayout} requiredRole="ROLE_ADMIN" />
      <Route exact path="/" component={StoreFront} />
      <Route path="/product/:id" component={ProductDetail} />
      <PrivateRoute path="/orders" component={MyOrders} />
      <Redirect from="*" to="/" />
    </Switch>
  </BrowserRouter>
);
