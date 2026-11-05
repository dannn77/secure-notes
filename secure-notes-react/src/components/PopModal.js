import * as React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Modal from "@mui/material/Modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Modals({ open, setOpen, noteId }) {
  const navigate = useNavigate();
  const [noteDeleteLoader, setNoteDeleteLoader] = React.useState(false);

  const onNoteDeleteHandler = async () => {
    try {
      setNoteDeleteLoader(true);

      await api.delete(`/notes/${noteId}`);
      toast.success("Note Delete successful");
      setOpen(false);
      navigate("/notes");
    } catch (err) {
      toast.error("Delete Note Failed");
    } finally {
      setNoteDeleteLoader(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="delete-note-title"
    >
      <div
        className="flex h-full items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <FiAlertTriangle className="text-xl" />
          </span>
          <h2
            id="delete-note-title"
            className="mt-4 text-lg font-semibold text-slate-900"
          >
            Delete this note?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This action can't be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={noteDeleteLoader}
              onClick={onNoteDeleteHandler}
              className="btn btn-danger"
            >
              {noteDeleteLoader ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
