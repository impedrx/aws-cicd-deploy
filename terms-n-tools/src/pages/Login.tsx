import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Erro no login', description: 'E-mail ou senha incorretos.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden dot-grid">
      <div className="w-full max-w-[380px] relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Auksys IT Tools</h1>
          <p className="text-sm text-muted-foreground mt-1">Plataforma de Gestão de TI</p>
        </div>

        <Card className="border shadow-md shadow-black/[0.06] dark:shadow-black/20">
          <CardContent className="p-7">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-foreground">Bem-vindo de volta</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Faça login para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analista@empresa.com"
                    className="pl-10 h-11 bg-muted/30 border-border/60 focus:bg-card transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="password" type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-muted/30 border-border/60 focus:bg-card transition-colors"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold mt-1"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-6 tracking-widest uppercase">
          Auksys IT Tools — Acesso Restrito
        </p>
      </div>
    </div>
  );
}
