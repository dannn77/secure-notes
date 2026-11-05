import React from "react";
import { Link } from "react-router-dom";
import { Brand } from "../Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
        <Link to="/" aria-label="SecureNotes home">
          <Brand small />
        </Link>

        <nav className="flex gap-6">
          <Link to="/about" className="hover:text-slate-900">
            About
          </Link>
          <Link to="/contact" className="hover:text-slate-900">
            Contact
          </Link>
        </nav>

        <p>&copy; {currentYear} SecureNotes. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
