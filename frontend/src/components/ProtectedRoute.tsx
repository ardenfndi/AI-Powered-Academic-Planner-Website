import { ReactNode, useEffect } from "react";

type ProtectedRouteProps = {
  isAuthenticated: boolean;
  loading?: boolean;
  onRedirect: () => void;
  children: ReactNode;
};

export default function ProtectedRoute({
  isAuthenticated,
  loading = false,
  onRedirect,
  children,
}: ProtectedRouteProps) {
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      onRedirect();
    }
  }, [isAuthenticated, loading, onRedirect]);

  if (loading) {
    return (
      <div className="panel-card panel-wide">
        <div className="panel-body">
          <div className="muted">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
