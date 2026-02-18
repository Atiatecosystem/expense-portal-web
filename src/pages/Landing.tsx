import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

/** Landing page — centered card with Atiat branding and CTA */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
          {/* Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Atiat Expense Portal
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A modern, secure platform for managing company expenses across your organization.
              Submit, review, and track reimbursements — all in one place.
            </p>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full text-base font-semibold"
            onClick={() => navigate("/login")}
          >
            Login To Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Landing;
