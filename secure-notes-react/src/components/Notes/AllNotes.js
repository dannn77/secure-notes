import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import NoteItems from "./NoteItems";
import { FiFileText, FiPlus } from "react-icons/fi";
import Errors from "../Errors";
import Loader from "../Loader";
import { parseNoteContent } from "../../utils/editorConfig";

const AllNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notes");

      const parsedNotes = response.data.map((note) => ({
        ...note,
        parsedContent: parseNoteContent(note.content),
      }));
      setNotes(parsedNotes);
    } catch (error) {
      setError(error?.response?.data?.message || "Error fetching notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            My Notes
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-slate-500">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          )}
        </div>
        <Link to="/create-note" className="btn btn-primary">
          <FiPlus /> New note
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <FiFileText className="text-xl" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No notes yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Start by creating a new note to keep track of your thoughts.
          </p>
          <Link to="/create-note" className="btn btn-primary mt-6">
            <FiPlus /> Create your first note
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((item) => (
            <NoteItems key={item.id} {...item} id={item.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllNotes;
