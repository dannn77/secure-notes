import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";
import moment from "moment";
import { truncateText } from "../../utils/truncateText";

const NoteItems = ({ parsedContent, id, createdAt }) => {
  const formattedDate = createdAt
    ? moment(createdAt).format("D MMM YYYY")
    : null;
  return (
    <Link
      to={`/notes/${id}`}
      className="card group flex h-64 flex-col p-5 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
    >
      <div className="relative flex-1 overflow-hidden">
        <div
          className="ql-editor !overflow-hidden !p-0 text-sm text-slate-700"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(truncateText(parsedContent)),
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          {formattedDate && (
            <>
              <FiCalendar />
              {formattedDate}
            </>
          )}
        </span>
        <span className="font-medium text-primary-600 opacity-0 transition group-hover:opacity-100">
          Open &rarr;
        </span>
      </div>
    </Link>
  );
};

export default NoteItems;
