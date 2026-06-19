import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="container-custom">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
