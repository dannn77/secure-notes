import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminSidebar from "./AdminAreaSidebar";
import UserList from "./UserList";
import UserDetails from "./UserDetails";
import { useMyContext } from "../../store/ContextApi";
import AuditLogsDetails from "./AuditLogsDetails";
import AdminAuditLogs from "./AdminAuditLogs";

const Admin = () => {
  const { openSidebar } = useMyContext();
  return (
    <div className="flex">
      <AdminSidebar />
      <div
        className={`min-h-[calc(100vh-64px)] w-full flex-1 overflow-hidden transition-all duration-150 ${
          openSidebar ? "ml-16 lg:ml-60" : "ml-16"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
          <Routes>
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="audit-logs/:noteId" element={<AuditLogsDetails />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/:userId" element={<UserDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
