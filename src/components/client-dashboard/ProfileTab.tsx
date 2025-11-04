import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface User {
  name: string;
  email: string;
  phone: string;
  telegram: string;
  city: string;
  bio: string;
  interests: string;
  email_notifications: boolean;
  telegram_notifications: boolean;
}

interface ProfileTabProps {
  user: User;
  isSubmitting: boolean;
  onUpdateUser: (updates: Partial<User>) => void;
  onSave: () => void;
}

export default function ProfileTab({ user, isSubmitting, onUpdateUser, onSave }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Личная информация</CardTitle>
          <CardDescription>Обновите свои личные данные</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input 
                id="name" 
                value={user.name} 
                onChange={(e) => onUpdateUser({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                value={user.email} 
                onChange={(e) => onUpdateUser({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={user.phone} 
                onChange={(e) => onUpdateUser({ phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input 
                id="telegram" 
                value={user.telegram} 
                onChange={(e) => onUpdateUser({ telegram: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">Город</Label>
              <Input 
                id="city" 
                value={user.city} 
                onChange={(e) => onUpdateUser({ city: e.target.value })}
                placeholder="Москва"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">О себе</Label>
            <Textarea 
              id="bio" 
              value={user.bio} 
              onChange={(e) => onUpdateUser({ bio: e.target.value })}
              placeholder="Расскажите немного о себе..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Интересы</Label>
            <Textarea 
              id="interests" 
              value={user.interests} 
              onChange={(e) => onUpdateUser({ interests: e.target.value })}
              placeholder="Ваши интересы и хобби..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Настройки уведомлений</CardTitle>
          <CardDescription>Управляйте способами получения уведомлений</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email уведомления</Label>
              <p className="text-sm text-muted-foreground">Получайте уведомления на email</p>
            </div>
            <Switch 
              id="email-notifications"
              checked={user.email_notifications}
              onCheckedChange={(checked) => onUpdateUser({ email_notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="telegram-notifications">Telegram уведомления</Label>
              <p className="text-sm text-muted-foreground">Получайте уведомления в Telegram</p>
            </div>
            <Switch 
              id="telegram-notifications"
              checked={user.telegram_notifications}
              onCheckedChange={(checked) => onUpdateUser({ telegram_notifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSubmitting || !user.name || !user.email}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </div>
    </div>
  );
}
