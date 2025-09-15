import {ReactNode} from "react";
import {useRoleAuth} from "@/hooks/useRoleAuth";
import UserHeader from "./headers/UserHeader";
import PatientHeader from "./headers/PatientHeader";
import DoctorHeader from "./headers/DoctorHeader";
import Footer from "./Footer";
import "@/i18n";

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export default function RoleBasedLayout({children}: RoleBasedLayoutProps) {
  const {userRole} = useRoleAuth();

  // Check for doctor session in localStorage
  const storedDoctor = localStorage.getItem("doctor");
  const effectiveRole = storedDoctor ? "doctor" : userRole;

  const renderHeader = () => {
    switch (effectiveRole) {
      case "user":
        return <UserHeader />;
      case "patient":
        return <PatientHeader />;
      case "doctor":
        return <DoctorHeader />;
      default:
        return <UserHeader />;
    }
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
      {renderHeader()}
      <div className="container mx-auto px-4 py-8">{children}</div>
      <Footer />
    </div>
  );
}
