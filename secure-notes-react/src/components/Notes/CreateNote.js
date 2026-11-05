import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import { editorModules, isEditorEmpty } from "../../utils/editorConfig";

const CreateNote = () => {
  const navigate = useNavigate();
  const [editorContent, setEditorContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (content, delta, source, editor) => {
    setEditorContent(content);
  };

  const handleSubmit = async () => {
    if (isEditorEmpty(editorContent)) {
      return toast.error("Note content is required");
    }
    try {
      setLoading(true);
      const noteData = { content: editorContent };
      await api.post("/notes", noteData);
      toast.success("Note create successful");
      navigate("/notes");
    } catch (err) {
      toast.error("Error creating note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          New note
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Write down anything you want to keep.
        </p>
      </div>

      <div className="card p-4 sm:p-6">
        <ReactQuill
          className="note-editor"
          value={editorContent}
          onChange={handleChange}
          modules={editorModules}
          placeholder="Start writing..."
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Buttons
          onClickhandler={() => navigate(-1)}
          className="btn btn-secondary"
        >
          Cancel
        </Buttons>
        <Buttons
          disabled={loading}
          onClickhandler={handleSubmit}
          className="btn btn-primary"
        >
          {loading ? "Saving..." : "Save note"}
        </Buttons>
      </div>
    </div>
  );
};

export default CreateNote;
