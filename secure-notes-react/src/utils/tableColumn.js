import { Link } from "react-router-dom";
import moment from "moment";
import Badge from "../components/Badge";
import { auditLogsTruncateTexts } from "./truncateText";
import { parseNoteContent } from "./editorConfig";

const actionTones = {
  CREATE: "green",
  UPDATE: "indigo",
  DELETE: "rose",
};

const cell = (content, className = "") => (
  <div className={`flex h-full items-center ${className}`}>{content}</div>
);

export const toAuditLogRow = (item) => ({
  id: item.id,
  noteId: item.noteId,
  actions: item.action,
  username: item.username,
  timestamp: moment(item.timestamp).format("MMMM DD, YYYY, hh:mm A"),
  note: item.noteContent,
});

export const auditLogscolumn = [
  {
    field: "actions",
    headerName: "Action",
    width: 120,
    disableColumnMenu: true,
    renderCell: (params) =>
      cell(
        <Badge tone={actionTones[params.value?.toUpperCase()] || "gray"}>
          {params.value}
        </Badge>
      ),
  },
  {
    field: "username",
    headerName: "User",
    width: 160,
    disableColumnMenu: true,
    renderCell: (params) => cell(params.value, "font-medium text-slate-900"),
  },
  {
    field: "timestamp",
    headerName: "Date",
    width: 210,
    disableColumnMenu: true,
    renderCell: (params) => cell(params.value, "text-slate-600"),
  },
  {
    field: "noteId",
    headerName: "Note",
    width: 90,
    disableColumnMenu: true,
    renderCell: (params) => cell(`#${params.value}`, "text-slate-600"),
  },
  {
    field: "note",
    headerName: "Content",
    minWidth: 220,
    flex: 1,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) =>
      cell(
        auditLogsTruncateTexts(parseNoteContent(params.value) || "", 50),
        "text-slate-600"
      ),
  },
];

export const auditLogsViewColumn = {
  field: "view",
  headerName: "",
  width: 100,
  sortable: false,
  disableColumnMenu: true,
  renderCell: (params) =>
    cell(
      <Link
        to={`/admin/audit-logs/${params.row.noteId}`}
        className="btn btn-secondary px-3 py-1.5 text-xs"
      >
        View
      </Link>,
      "justify-end"
    ),
};
