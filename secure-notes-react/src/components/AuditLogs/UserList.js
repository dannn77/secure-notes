import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import Errors from "../Errors.js";
import moment from "moment";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import Badge from "../Badge";
import DataTable from "../DataTable";


const userListsColumns = [
  {
    field: "username",
    headerName: "User",
    minWidth: 200,
    flex: 1,
    disableColumnMenu: true,
    renderCell: (params) => (
      <div className="flex h-full items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
          {params.value?.slice(0, 2).toUpperCase()}
        </span>
        <span className="font-medium text-slate-900">{params.value}</span>
      </div>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 220,
    flex: 1,
    disableColumnMenu: true,
    renderCell: (params) => (
      <div className="flex h-full items-center text-slate-600">
        {params.value}
      </div>
    ),
  },
  {
    field: "created",
    headerName: "Created",
    width: 150,
    disableColumnMenu: true,
    renderCell: (params) => (
      <div className="flex h-full items-center text-slate-600">
        {params.value}
      </div>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    disableColumnMenu: true,
    renderCell: (params) => (
      <div className="flex h-full items-center">
        <Badge tone={params.value === "Active" ? "green" : "gray"}>
          {params.value}
        </Badge>
      </div>
    ),
  },
  {
    field: "action",
    headerName: "",
    width: 100,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <div className="flex h-full items-center justify-end">
        <Link
          to={`/admin/users/${params.id}`}
          className="btn btn-secondary px-3 py-1.5 text-xs"
        >
          View
        </Link>
      </div>
    ),
  },
];

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/getusers");
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
      } catch (err) {
        setError(err?.response?.data?.message);

        toast.error("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const rows = users.map((item) => {
    const formattedDate = moment(item.createdDate).format("D MMM YYYY");

    return {
      id: item.userId,
      username: item.userName,
      email: item.email,
      created: formattedDate,
      status: item.enabled ? "Active" : "Inactive",
    };
  });

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {loading
            ? "Loading accounts..."
            : `${users.length} registered ${
                users.length === 1 ? "account" : "accounts"
              }`}
        </p>
      </div>
      <div className="card overflow-hidden">
        {loading ? <Loader /> : <DataTable rows={rows} columns={userListsColumns} />}
      </div>
    </div>
  );
};

export default UserList;
