import React, { useState } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import ManageUsers from "../Components/Dashboards/AdminDashboard/ManageUsers";
import AdminDashboard from "../Components/Dashboards/AdminDashboard/AdminDashboard";
import ManageFarms from "../Components/Dashboards/AdminDashboard/ManageFarms";
import FinancialReports from "../Components/Dashboards/AdminDashboard/FinancialReports";
import Settings from "../Components/Dashboards/AdminDashboard/Settings";
import AdminHelpSupport from "../Components/Dashboards/AdminDashboard/AdminHelpSupport";
import AdminHeader from "../Components/Dashboards/AdminDashboard/AdminHeader";
import AdminNavbar from "../Components/Dashboards/AdminDashboard/AdminNavbar";


const Admin = () => {
  const [activeComponent, setActiveComponent] = useState('CustomerNavbar');
  const handleNavbarClick = (componentName) => {
    setActiveComponent(componentName); // Update the state to the selected component
  };
  let componentToRender;
  switch (activeComponent) {
    case '  Dashboard':
      componentToRender = <AdminDashboard />;
      break;
    case 'Manage Farms':
      componentToRender = <ManageFarms />;
      break;
    case 'Manage Users':
      componentToRender = <ManageUsers />;
      break;
    case 'Financial Reports':
      componentToRender = <FinancialReports />;
      break;
    case 'System Settings':
      componentToRender = <Settings />;
      break;
    case 'Help & Support':
      componentToRender = <AdminHelpSupport />;
      break;
    case 'Roles':
      componentToRender = <Roles />;
      break;
    default:
      componentToRender = <AdminDashboard />;
      break;
  }
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AdminHeader toggle={toggle} opened={opened} />
      <AppShell.Navbar><AdminNavbar onLinkClick={handleNavbarClick} /></AppShell.Navbar>
      <AppShell.Main>{componentToRender}</AppShell.Main>
    </AppShell>
  );
};

export default Admin;
