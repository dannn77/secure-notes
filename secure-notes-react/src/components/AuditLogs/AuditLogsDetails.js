import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api from "../../services/api";
import Errors from "../Errors.js";
import Loader from "../Loader";
import DataTable from "../DataTable";
import { auditLogscolumn, toAuditLogRow } from "../../utils/tableColumn.js";

const AuditLogsDetails = () => {
  const { noteId } = useParams();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSingleAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/audit/note/${noteId}`);

      setAuditLogs(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Error fetching audit logs");
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (noteId) {
      fetchSingleAuditLogs();
    }
  }, [noteId, fetchSingleAuditLogs]);

  const rows = auditLogs.map(toAuditLogRow);

  if (error) {
    return <Errors message={error} />;
  }

  if (!loading && auditLogs.length === 0) {
    return <Errors message="Invalid NoteId" />;
  }

  return (
    <div>
      <Link
        to="/admin/audit-logs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <FiArrowLeft /> All audit logs
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Note #{noteId}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Full history of changes for this note.
        </p>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <Loader />
        ) : (
          <DataTable rows={rows} columns={auditLogscolumn} />
        )}
      </div>
    </div>
  );
};

export default AuditLogsDetails;
