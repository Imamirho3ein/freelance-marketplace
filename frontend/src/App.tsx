import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import ContractDetail from "@/pages/ContractDetail";
import CreateProject from "@/pages/CreateProject";
import Freelancers from "@/pages/Freelancers";
import FreelancerDetail from "@/pages/FreelancerDetail";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/contracts/:id" element={<ContractDetail />} />
              <Route path="/freelancers" element={<Freelancers />} />
              <Route path="/freelancers/:id" element={<FreelancerDetail />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/projects/new" element={<CreateProject />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              <Route element={<ProtectedRoute roles={["admin"]} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
