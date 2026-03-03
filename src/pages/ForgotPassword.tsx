import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ImageRenderer from "@/components/ImageRenderer";
import logoIcon from "@/assets/images/logo.png"

/** Forgot Password page */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent to " + email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardContent className="flex flex-col gap-6 p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-auto items-center justify-center rounded-xl bg-transparent">
              <ImageRenderer
                src={logoIcon}
                alt="Logo"
                className="h-7 w-7 text-primary-foreground"
              />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {sent ? "Check Your Email" : "Forgot Password"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {sent
                ? "We've sent a password reset link to your email address."
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-status-approved" />
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/login")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
