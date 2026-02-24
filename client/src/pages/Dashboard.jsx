import LeaveCalendar from "../components/LeaveCalendar";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "40px", background: "#000", minHeight: "100vh" }}>
      {user?.role === 'admin' ? <AdminDashboard /> : <LeaveCalendar />}
    </div>
  );
}

export default Dashboard;
