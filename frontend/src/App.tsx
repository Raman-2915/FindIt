import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import LostItems from "./pages/Items/LostItems";
import ReportLost from "./pages/Items/ReportLost";
import FoundItems from "./pages/Items/FoundItems";
import ReportFound from "./pages/Items/ReportFound";
import ItemDetails from "./pages/Items/ItemDetails";
import MyItems from "./pages/Items/MyItems";
import Notifications from "./pages/Notifications/Notifications";
import Matches from "./pages/Matches/Matches";

function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lost-items/:id" element={<ItemDetails />} />
              <Route path="/found-items/:id" element={<ItemDetails />} />
              <Route path="/lost-items" element={<LostItems />} />
              <Route path="/lost-items/create" element={<ReportLost />} />
              <Route path="/found-items" element={<FoundItems />} />
              <Route path="/found-items/create" element={<ReportFound />} />
              <Route path="/my-items" element={<MyItems />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/matches" element={<Matches />} />

              <Route path="/my-lost-items" element={<Navigate to="/my-items" replace />} />
              <Route path="/my-found-items" element={<Navigate to="/my-items" replace />} />
              <Route path="/claims" element={<Placeholder name="Claims" />} />
              <Route path="/reports" element={<Placeholder name="Reports" />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<Placeholder name="Admin Dashboard" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
