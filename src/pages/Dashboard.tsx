import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/** Employee dashboard — empty state or summary */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName}.</p>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-card py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">No Request Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first expense request to get started.
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/requests/new")} className="mt-2">
          <Plus className="mr-2 h-4 w-4" />
          Create A Request
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
