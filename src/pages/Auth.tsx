import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlowCard } from "@/components/ui/GlowCard";
import { Moon, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email("올바른 이메일을 입력해주세요");
const passwordSchema = z.string().min(6, "비밀번호는 6자 이상이어야 합니다");

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("이메일 또는 비밀번호가 올바르지 않습니다");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("이메일 인증을 완료해주세요");
          } else {
            toast.error(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("이미 등록된 이메일입니다");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("인증 이메일이 발송되었습니다. 이메일을 확인해주세요!");
          setIsLogin(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent p-1 mb-6">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <Moon className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="gradient-text">꿈 해석기</span>
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "다시 오신 것을 환영합니다" : "새로운 여정을 시작하세요"}
          </p>
        </div>

        {/* Auth Form */}
        <GlowCard variant="default" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                이메일
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-6 bg-muted/50 border-border/50 focus:border-primary"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 bg-muted/50 border-border/50 focus:border-primary"
                  disabled={isSubmitting}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-6 rounded-xl font-semibold",
                "bg-gradient-to-r from-primary to-accent",
                "hover:shadow-neon transition-all duration-300"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "로그인"
              ) : (
                "회원가입"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? (
                <>
                  계정이 없으신가요?{" "}
                  <span className="text-primary font-medium">회원가입</span>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{" "}
                  <span className="text-primary font-medium">로그인</span>
                </>
              )}
            </button>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
