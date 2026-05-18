import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/');
    }
    setIsSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <>
        <Helmet>
          <title>Reset Password - PaperLAN.io</title>
          <meta name="description" content="Reset your PaperLAN.io account password to regain access to the SOC dashboard." />
          <link rel="canonical" href="https://cyber-watcher-x.lovable.app/reset-password" />
          <meta property="og:image" content="https://cyber-watcher-x.lovable.app/og-image.png" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Invalid or expired reset link. Please request a new one.
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password - PaperLAN.io</title>
        <meta name="description" content="Set a new password for your PaperLAN.io account." />
        <link rel="canonical" href="https://cyber-watcher-x.lovable.app/reset-password" />
        <meta property="og:title" content="Reset Password - PaperLAN.io" />
        <meta property="og:description" content="Securely reset your PaperLAN.io account password." />
        <meta property="og:url" content="https://cyber-watcher-x.lovable.app/reset-password" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
          <CardTitle className="text-foreground">Set New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="new-password" type="password" placeholder="••••••••" className="pl-9" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </>
  );
}
