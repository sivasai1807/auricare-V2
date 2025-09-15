import {Link, NavLink} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Menu, User, LogOut, Stethoscope} from "lucide-react";
import {useState} from "react";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useTranslation} from "react-i18next";
import LanguageSelector from "@/components/ui/LanguageSelector";

const navItems = [
  {to: "/doctor/dashboard", key: "nav.dashboard"},
  {to: "/doctor/appointments", key: "nav.appointments"},
  {to: "/doctor/schedule", key: "nav.schedule"},
  {to: "/doctor/learning", key: "nav.learning"},
  {to: "/doctor/chatbot", key: "nav.aiAssistant"},
];

export default function DoctorHeader() {
  const [open, setOpen] = useState(false);
  const {user, signOut} = useRoleAuth();
  const {t} = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        <Link
          to="/doctor/dashboard"
          className="flex items-center gap-2 font-heading text-xl font-bold"
        >
          <Stethoscope className="size-6 text-purple-600" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {t("brand.doctor")}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({isActive}) =>
                `transition-colors hover:text-purple-600 ${
                  isActive ? "text-purple-600 font-medium" : "text-gray-600"
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User className="size-4" />
                  {user.user_metadata?.name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/90 backdrop-blur"
              >
                <DropdownMenuItem asChild>
                  <Link to="/doctor/dashboard">{t("nav.dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="size-4 mr-2" />
                  {t("auth.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="glow" size="sm">
                {t("auth.getStarted")}
              </Button>
            </Link>
          )}
        </div>

        <button
          className="md:hidden p-2"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          <Menu className="size-6" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white/90 backdrop-blur">
          <nav className="container py-3 grid grid-cols-2 gap-3 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="text-sm text-gray-600 hover:text-purple-600"
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </NavLink>
            ))}
            <div className="col-span-2">
              {user ? (
                <Button className="w-full" variant="ghost" onClick={signOut}>
                  {t("auth.signOut")}
                </Button>
              ) : (
                <Button className="w-full" variant="glow">
                  {t("auth.getStarted")}
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
