import React, { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Errors from "../Errors.js";
import Loader from "../Loader";
import DataTable from "../DataTable";
import {
  auditLogscolumn,
  auditLogsViewColumn,
  toAuditLogRow,
} from "../../utils/tableColumn.js";

const columns = [...auditLogscolumn, auditLogsViewColumn];

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/audit");
      setAuditLogs(response.data);
    } catch (err) {
      setError(err?.response?.data?.message);
      toast.error("Error fetching audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const rows = auditLogs.map(toAuditLogRow);

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Audit logs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every note created, edited or deleted across the app.
        </p>
      </div>
      <div className="card overflow-hidden">
        {loading ? <Loader /> : <DataTable rows={rows} columns={columns} />}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
