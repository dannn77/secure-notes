import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import moment from "moment";
import DOMPurify from "dompurify";
import DataTable from "../DataTable";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import Errors from "../Errors";
import Loader from "../Loader";
import toast from "react-hot-toast";
import Modals from "../PopModal";
import { auditLogscolumn, toAuditLogRow } from "../../utils/tableColumn";
import { useMyContext } from "../../store/ContextApi";
import {
  editorModules,
  isEditorEmpty,
  parseNoteContent,
} from "../../utils/editorConfig";

const NoteDetails = () => {
  const { id } = useParams();
  const [modalOpen, setModalOpen] = useState(false);

  const [note, setNote] = useState(null);

  const [editorContent, setEditorContent] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const { isAdmin } = useMyContext();
  const [loading, setLoading] = useState(false);
  const [noteEditLoader, setNoteEditLoader] = useState(false);
  const [editEnable, setEditEnable] = useState(false);
  const navigate = useNavigate();

  const fetchNoteDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/notes");
      const foundNote = response.data.find((n) => n.id.toString() === id);
      if (foundNote) {
        foundNote.parsedContent = parseNoteContent(foundNote.content);
        setNote(foundNote);
      } else {
        setError("Invalid Note");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error fetching note");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await api.get(`/audit/note/${id}`);
      setAuditLogs(response.data);
    } catch (err) {
      toast.error("Error fetching audit logs");
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchNoteDetails();
    }
  }, [id, fetchNoteDetails]);

  useEffect(() => {
    if (id && isAdmin) {
      fetchAuditLogs();
    }
  }, [id, isAdmin, fetchAuditLogs]);

  useEffect(() => {
    if (note?.parsedContent) {
      setEditorContent(note.parsedContent);
    }
  }, [note?.parsedContent]);

  const rows = auditLogs.map(toAuditLogRow);

  if (error) {
    return <Errors message={error} />;
  }

  const handleChange = (content, delta, source, editor) => {
    setEditorContent(content);
  };

  const onCancelEditHandler = () => {
    setEditorContent(note?.parsedContent);
    setEditEnable(false);
  };

  const onNoteEditHandler = async () => {
    if (isEditorEmpty(editorContent)) {
      return toast.error("Note content Shouldn't be empty");
    }

    try {
      setNoteEditLoader(true);
      const noteData = { content: editorContent };
      await api.put(`/notes/${id}`, noteData);
      toast.success("Note update successful");
      setEditEnable(false);
      fetchNoteDetails();
      if (isAdmin) {
        fetchAuditLogs();
      }
    } catch (err) {
      toast.error("Update Note Failed");
    } finally {
      setNoteEditLoader(false);
    }
  };

  const onBackHandler = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Buttons
          onClickhandler={onBackHandler}
          className="btn px-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <FiArrowLeft /> Back
        </Buttons>

        {!loading && note && (
          <div className="flex gap-2">
            {editEnable ? (
              <>
                <Buttons
                  onClickhandler={onCancelEditHandler}
                  className="btn btn-secondary"
                >
                  Cancel
                </Buttons>
                <Buttons
                  disabled={noteEditLoader}
                  onClickhandler={onNoteEditHandler}
                  className="btn btn-primary"
                >
                  {noteEditLoader ? "Saving..." : "Save changes"}
                </Buttons>
              </>
            ) : (
              <>
                <Buttons
                  onClickhandler={() => setEditEnable(true)}
                  className="btn btn-secondary"
                >
                  <FiEdit2 /> Edit
                </Buttons>
                <Buttons
                  onClickhandler={() => setModalOpen(true)}
                  className="btn btn-secondary text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                >
                  <FiTrash2 /> Delete
                </Buttons>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card p-6 sm:p-8">
        {loading ? (
          <Loader />
        ) : editEnable ? (
          <ReactQuill
            className="note-editor"
            value={editorContent}
            onChange={handleChange}
            modules={editorModules}
          />
        ) : (
          <>
            {note?.createdAt && (
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                Created {moment(note.createdAt).format("D MMMM YYYY")}
              </p>
            )}
            <div
              className="ql-editor !p-0 text-slate-800"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(note?.parsedContent || ""),
              }}
            />
          </>
        )}
      </div>

      {isAdmin && !editEnable && !loading && (
        <div className="card mt-8 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Audit logs
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <DataTable rows={rows} columns={auditLogscolumn} />
          </div>
        </div>
      )}

      <Modals open={modalOpen} setOpen={setModalOpen} noteId={id} />
    </div>
  );
};

export default NoteDetails;
