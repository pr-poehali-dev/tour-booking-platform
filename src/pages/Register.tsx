import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<'client' | 'guide'>('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    languages: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://your-backend-url/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });

      if (!response.ok) throw new Error('Ошибка регистрации');

      toast({
        title: 'Успешная регистрация!',
        description: 'Добро пожаловать в ТурГид',
      });

      if (role === 'guide') {
        navigate('/guide');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось зарегистрироваться. Попробуйте снова.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Icon name="Compass" size={40} className="text-primary" />
            <span className="text-3xl font-heading font-bold">ТурГид</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold mb-2">Регистрация</h1>
          <p className="text-muted-foreground">Создайте аккаунт и начните путешествовать</p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={role} onValueChange={(v) => setRole(v as 'client' | 'guide')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client">Я путешественник</TabsTrigger>
                <TabsTrigger value="guide">Я гид</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Имя и фамилия</label>
                <Input
                  required
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  required
                  type="email"
                  placeholder="ivan@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Пароль</label>
                <Input
                  required
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  minLength={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Телефон</label>
                <Input
                  required
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              {role === 'guide' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">О себе</label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      placeholder="Расскажите о своем опыте..."
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Языки</label>
                    <Input
                      placeholder="Русский, Английский"
                      value={formData.languages}
                      onChange={(e) => handleChange('languages', e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Войти
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
