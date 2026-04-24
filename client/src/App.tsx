import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "@/api/client";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setHydrated, setUser, clearAuth } from "@/features/auth/authSlice";
import type { User } from "@/types";

import { PublicLayout } from "@/layouts/PublicLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

import { HomePage } from "@/pages/HomePage";
import { ExplorePage } from "@/pages/ExplorePage";
import { StayPage } from "@/pages/StayPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPage } from "@/pages/ForgotPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogArticlePage } from "@/pages/BlogArticlePage";
import { ContactPage } from "@/pages/ContactPage";

import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { TripsPage } from "@/pages/dashboard/TripsPage";
import { HostBookingsPage } from "@/pages/dashboard/HostBookingsPage";
import { ListingsPage } from "@/pages/dashboard/ListingsPage";
import { ListingEditorPage } from "@/pages/dashboard/ListingEditorPage";
import { AnalyticsPage } from "@/pages/dashboard/AnalyticsPage";
import { CashflowPage } from "@/pages/dashboard/CashflowPage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { NotificationsPage } from "@/pages/dashboard/NotificationsPage";
import { MyBlogPage } from "@/pages/dashboard/MyBlogPage";
import { AdminPage } from "@/pages/dashboard/AdminPage";
import { ToastHost } from "@/components/ToastHost";

function Protected({ children, roles }: { children: React.ReactNode; roles?: User["role"][] }) {
  const { token, user, hydrated } = useAppSelector((s) => s.auth);
  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-ink-200">
        <span className="animate-pulse">Loading session…</span>
      </div>
    );
  }
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function HostOnly({ children }: { children: React.ReactNode }) {
  return <Protected roles={["host", "admin"]}>{children}</Protected>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  return <Protected roles={["admin"]}>{children}</Protected>;
}

export default function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        dispatch(setHydrated());
        return;
      }
      try {
        const { data } = await api.get<{ user: User }>("/auth/me");
        dispatch(setUser(data.user));
      } catch {
        dispatch(clearAuth());
      } finally {
        dispatch(setHydrated());
      }
    };
    void run();
  }, [dispatch, token]);

  // store token+user on login from Register - already in slice

  return (
    <>
      <ToastHost />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/stay/:id" element={<StayPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/p/:id" element={<BlogArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardLayout />
            </Protected>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="trips" element={<TripsPage />} />
          <Route
            path="bookings"
            element={
              <HostOnly>
                <HostBookingsPage />
              </HostOnly>
            }
          />
          <Route
            path="listings"
            element={
              <HostOnly>
                <ListingsPage />
              </HostOnly>
            }
          />
          <Route
            path="listings/new"
            element={
              <HostOnly>
                <ListingEditorPage />
              </HostOnly>
            }
          />
          <Route
            path="listings/:id"
            element={
              <HostOnly>
                <ListingEditorPage />
              </HostOnly>
            }
          />
          <Route
            path="analytics"
            element={
              <HostOnly>
                <AnalyticsPage />
              </HostOnly>
            }
          />
          <Route path="cashflow" element={<CashflowPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="my-blog" element={<MyBlogPage />} />
          <Route
            path="admin"
            element={
              <AdminOnly>
                <AdminPage />
              </AdminOnly>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
