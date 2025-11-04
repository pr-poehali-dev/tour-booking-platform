import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ChatWidget from '@/components/ChatWidget';
import NotificationBell from '@/components/NotificationBell';
import { profileApi } from '@/lib/profileApi';
import ClientSidebar from '@/components/client-dashboard/ClientSidebar';
import BookingsTab from '@/components/client-dashboard/BookingsTab';
import FavoritesTab from '@/components/client-dashboard/FavoritesTab';
import ProfileTab from '@/components/client-dashboard/ProfileTab';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const [user, setUser] = useState({
    id: 0,
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
    phone: '',
    telegram: '',
    city: '',
    bio: '',
    interests: '',
    email_notifications: true,
    telegram_notifications: false,
    memberSince: 'Октябрь 2023',
    totalBookings: 12,
    totalSpent: 145000
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);
    if (userData.role !== 'client') {
      navigate('/');
      return;
    }

    setUser({
      id: userData.id || 0,
      name: userData.name || 'Пользователь',
      email: userData.email || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name || 'User'}`,
      phone: '',
      telegram: '',
      city: '',
      bio: '',
      interests: '',
      email_notifications: true,
      telegram_notifications: false,
      memberSince: 'Октябрь 2023',
      totalBookings: 12,
      totalSpent: 145000
    });

    if (userData.id) {
      profileApi.getProfile(userData.id).then(profile => {
        setUser(prev => ({
          ...prev,
          phone: profile.phone || '',
          telegram: profile.telegram || '',
          city: profile.city || '',
          bio: profile.bio || '',
          interests: profile.interests || '',
          email_notifications: profile.email_notifications ?? true,
          telegram_notifications: profile.telegram_notifications ?? false
        }));
      }).catch(console.error);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user.name || !user.email) {
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.updateProfile({
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        telegram: user.telegram,
        city: user.city,
        bio: user.bio,
        interests: user.interests,
        email_notifications: user.email_notifications,
        telegram_notifications: user.telegram_notifications
      });

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.name = user.name;
        userData.email = user.email;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bookings: any[] = [];
  const favorites: any[] = [];
  
  const upcomingBookings = bookings.filter((b: any) => b.status === 'upcoming' || b.status === 'confirmed');
  const completedBookings = bookings.filter((b: any) => b.status === 'completed');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      upcoming: { label: 'Предстоит', variant: 'default' },
      confirmed: { label: 'Подтверждено', variant: 'secondary' },
      completed: { label: 'Завершено', variant: 'outline' }
    };
    
    const config = statusConfig[status] || statusConfig.upcoming;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Icon name="Compass" size={32} className="text-primary" />
              <span className="text-2xl font-heading font-bold text-foreground">ТурГид</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/">Каталог туров</Link>
              </Button>
              <NotificationBell userId={3} />
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ClientSidebar user={user} onLogout={handleLogout} />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-4xl font-heading font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Управляйте своими бронированиями и избранными турами</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Icon name="Calendar" size={18} />
                  Бронирования
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Icon name="Heart" size={18} />
                  Избранное
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Icon name="User" size={18} />
                  Профиль
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings">
                <BookingsTab 
                  upcomingBookings={upcomingBookings}
                  completedBookings={completedBookings}
                  selectedBookingId={selectedBookingId}
                  onSelectBooking={setSelectedBookingId}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>

              <TabsContent value="favorites">
                <FavoritesTab favorites={favorites} />
              </TabsContent>

              <TabsContent value="profile">
                <ProfileTab 
                  user={user}
                  isSubmitting={isSubmitting}
                  onUpdateUser={(updates) => setUser(prev => ({ ...prev, ...updates }))}
                  onSave={handleSaveProfile}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {selectedBookingId && <ChatWidget recipientId={selectedBookingId} />}
    </div>
  );
}
