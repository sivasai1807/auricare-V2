import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Heart } from "lucide-react";
import { useState } from "react";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/patient/dashboard", label: "Dashboard" },
  { to: "/patient/progress", label: "Progress" },
  { to: "/patient/appointments", label: "Appointments" },
  { to: "/patient/chatbot", label: "Chatbot" },
  { to: "/patient/schedule", label: "Schedule" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
];

export default function PatientHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useRoleAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        <Link to="/patient/dashboard" className="flex items-center gap-2 font-heading text-xl font-bold">
          <Heart className="size-6 text-green-600" />
          <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Patient Portal
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors hover:text-green-600 ${isActive ? 'text-green-600 font-medium' : 'text-gray-600'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="size-4" />
                  {user.user_metadata?.first_name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur">
                <DropdownMenuItem asChild>
                  <Link to="/patient/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth"><Button variant="glow" size="sm">Get Started</Button></Link>
          )}
        </div>

        <button className="md:hidden p-2" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <Menu className="size-6" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white/90 backdrop-blur">
          <nav className="container py-3 grid grid-cols-2 gap-3 px-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="text-sm text-gray-600 hover:text-green-600" onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <div className="col-span-2">
              {user ? (
                <Button className="w-full" variant="ghost" onClick={signOut}>Sign Out</Button>
              ) : (
                <Button className="w-full" variant="glow">Get Started</Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}