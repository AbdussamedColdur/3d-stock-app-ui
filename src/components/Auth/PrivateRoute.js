import React from "react";
import { Route, Redirect } from "react-router-dom";
import { hasRole, isAuthenticated } from "services/authService";

function PrivateRoute({ component: Component, requiredRole, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated()) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location.pathname },
              }}
            />
          );
        }

        if (requiredRole && !hasRole(requiredRole)) {
          return <Redirect to="/" />;
        }

        return <Component {...props} />;
      }}
    />
  );
}

export default PrivateRoute;
