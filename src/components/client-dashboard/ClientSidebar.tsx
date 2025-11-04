import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface ClientSidebarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    memberSince: string;
    totalBookings: number;
    totalSpent: number;
  };
  onLogout: () => void;
}

export default function ClientSidebar({ user, onLogout }: ClientSidebarProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-heading">{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} />
          <span>С нами с {user.memberSince}</span>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{user.totalBookings}</div>
            <div className="text-xs text-muted-foreground">Туров</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{user.totalSpent.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Потрачено ₽</div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/profile">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/settings">
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={onLogout}>
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
