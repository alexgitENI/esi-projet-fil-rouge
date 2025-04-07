// medisecure-frontend/src/components/layout/SideBar/SideBar.tsx

import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

interface NavItemProps {
  to: string;
  icon: JSX.Element;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ mobile = false, onClose }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white">
      {/* En-tête sidebar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
        <Link
          to="/"
          className="text-primary-600 font-display font-bold text-xl"
        >
          MediSecure
        </Link>
        {mobile && onClose && (
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            <span className="sr-only">Fermer le menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Contenu sidebar */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItem
            to="/dashboard"
            icon={
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            }
            label="Tableau de bord"
          />
          {/* Autres NavItems ici... */}
        </nav>
      </div>

      {/* Information utilisateur */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
            {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-700">
              {user?.email || "Utilisateur"}
            </p>
            <p className="text-xs text-slate-500">{user?.role || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
