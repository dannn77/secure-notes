import { htmlToText } from "html-to-text";

export const isEditorEmpty = (html) =>
  htmlToText(html || "", { wordwrap: false }).trim().length === 0;

export const parseNoteContent = (content) => {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed?.content === "string" ? parsed.content : content;
  } catch {
    return content;
  }
};

export const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["clean"],
  ],
};
