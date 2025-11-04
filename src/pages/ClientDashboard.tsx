import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import ChatWidget from '@/components/ChatWidget';
import NotificationBell from '@/components/NotificationBell';
import { profileApi } from '@/lib/profileApi';

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

  const bookings = [
    {
      id: 1,
      tourTitle: 'Исторический центр Праги',
      tourImage: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/ccd38c6a-3856-42af-b730-29c8aa56c8ea.jpg',
      city: 'Прага',
      country: 'Чехия',
      date: '15 декабря 2024',
      status: 'upcoming',
      price: 3500,
      guide: 'Анна Новикова',
      guideAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
      participants: 2
    },
    {
      id: 2,
      tourTitle: 'Горный поход в Альпах',
      tourImage: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/cd6e6544-d11b-4b3d-b500-bd94c90cbc08.jpg',
      city: 'Инсбрук',
      country: 'Австрия',
      date: '22 января 2025',
      status: 'confirmed',
      price: 15000,
      guide: 'Михаил Петров',
      guideAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mikhail',
      participants: 4
    },
    {
      id: 3,
      tourTitle: 'Средиземноморское побережье',
      tourImage: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/d83244a1-dd1c-448a-8abc-9c02416fbff3.jpg',
      city: 'Барселона',
      country: 'Испания',
      date: '10 октября 2024',
      status: 'completed',
      price: 25000,
      guide: 'Елена Соколова',
      guideAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      participants: 2,
      rating: 5
    },
    {
      id: 4,
      tourTitle: 'Пражский Град и замки',
      tourImage: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/ccd38c6a-3856-42af-b730-29c8aa56c8ea.jpg',
      city: 'Прага',
      country: 'Чехия',
      date: '5 сентября 2024',
      status: 'completed',
      price: 4200,
      guide: 'Анна Новикова',
      guideAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
      participants: 3,
      rating: 4
    }
  ];

  const favorites = [
    {
      id: 5,
      title: 'Велосипедный тур по набережной',
      city: 'Прага',
      country: 'Чехия',
      price: 2800,
      rating: 4.9,
      reviews: 156,
      image: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/cd6e6544-d11b-4b3d-b500-bd94c90cbc08.jpg',
      duration: '4 часа'
    },
    {
      id: 6,
      title: 'Гастрономический тур',
      city: 'Прага',
      country: 'Чехия',
      price: 5500,
      rating: 5.0,
      reviews: 203,
      image: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/d83244a1-dd1c-448a-8abc-9c02416fbff3.jpg',
      duration: '5 часов'
    },
    {
      id: 7,
      title: 'Ночная Прага',
      city: 'Прага',
      country: 'Чехия',
      price: 3200,
      rating: 4.8,
      reviews: 98,
      image: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/ccd38c6a-3856-42af-b730-29c8aa56c8ea.jpg',
      duration: '3 часа'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      upcoming: { label: 'Предстоит', variant: 'default' },
      confirmed: { label: 'Подтверждено', variant: 'secondary' },
      completed: { label: 'Завершено', variant: 'outline' }
    };
    
    const config = statusConfig[status] || statusConfig.upcoming;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

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
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleLogout}>
                    <Icon name="LogOut" size={18} className="mr-2" />
                    Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-4xl font-heading font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Управляйте своими бронированиями и избранными турами</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Icon name="Calendar" size={18} />
                  <span>Мои бронирования</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Icon name="Heart" size={18} />
                  <span>Избранное</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Icon name="Star" size={18} />
                  <span>Отзывы</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Icon name="User" size={18} />
                  <span>Профиль</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                {upcomingBookings.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-heading font-semibold mb-4">Предстоящие туры</h2>
                    <div className="grid gap-6">
                      {upcomingBookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="md:flex">
                            <div className="md:w-1/3 h-48 md:h-auto">
                              <img 
                                src={booking.tourImage}
                                alt={booking.tourTitle}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Badge variant="outline" className="mb-2">{booking.city}, {booking.country}</Badge>
                                    <CardTitle className="font-heading mb-1">{booking.tourTitle}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                      <Icon name="Calendar" size={14} />
                                      <span>{booking.date}</span>
                                    </CardDescription>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={booking.guideAvatar} />
                                      <AvatarFallback>Г</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">{booking.guide}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Icon name="Users" size={14} />
                                    <span>{booking.participants} чел.</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-2xl font-bold text-primary">
                                    {(booking.price * booking.participants).toLocaleString()} ₽
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedBookingId(selectedBookingId === booking.id ? null : booking.id)}
                                    >
                                      <Icon name="MessageCircle" size={16} className="mr-2" />
                                      {selectedBookingId === booking.id ? 'Закрыть чат' : 'Написать гиду'}
                                    </Button>
                                    <Button size="sm" asChild>
                                      <Link to={`/tour/${booking.id}`}>Подробнее</Link>
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                              {selectedBookingId === booking.id && (
                                <div className="border-t p-4">
                                  <ChatWidget
                                    bookingId={booking.id}
                                    currentUserId={3}
                                    currentUserName={user.name}
                                    otherUserName={booking.guide}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {completedBookings.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-heading font-semibold mb-4">История поездок</h2>
                    <div className="grid gap-6">
                      {completedBookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                          <div className="md:flex">
                            <div className="md:w-1/3 h-48 md:h-auto relative">
                              <img 
                                src={booking.tourImage}
                                alt={booking.tourTitle}
                                className="w-full h-full object-cover opacity-90"
                              />
                              <div className="absolute top-4 right-4">
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <CardHeader>
                                <Badge variant="outline" className="mb-2 w-fit">{booking.city}, {booking.country}</Badge>
                                <CardTitle className="font-heading mb-1">{booking.tourTitle}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  <Icon name="Calendar" size={14} />
                                  <span>{booking.date}</span>
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={booking.guideAvatar} />
                                      <AvatarFallback>Г</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">{booking.guide}</span>
                                  </div>
                                  {booking.rating && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Icon
                                          key={i}
                                          name="Star"
                                          size={14}
                                          className={i < booking.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-lg font-semibold text-muted-foreground">
                                    {(booking.price * booking.participants).toLocaleString()} ₽
                                  </div>
                                  {!booking.rating && (
                                    <Button variant="outline" size="sm">
                                      <Icon name="Star" size={16} className="mr-2" />
                                      Оставить отзыв
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-semibold">
                    Избранное ({favorites.length})
                  </h2>
                  <Button variant="outline" asChild>
                    <Link to="/">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Найти туры
                    </Link>
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {favorites.map((tour) => (
                    <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={tour.image_url || tour.image}
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                        >
                          <Icon name="Heart" size={20} className="text-red-500 fill-red-500" />
                        </Button>
                        <Badge className="absolute bottom-4 left-4 bg-white text-foreground">
                          {tour.duration}
                        </Badge>
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{tour.city}, {tour.country}</Badge>
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">{tour.rating}</span>
                            <span className="text-xs text-muted-foreground">({tour.reviews})</span>
                          </div>
                        </div>
                        <CardTitle className="font-heading line-clamp-2">{tour.title}</CardTitle>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {tour.price.toLocaleString()} ₽
                        </div>
                        <Button asChild>
                          <Link to={`/tour/${tour.id}`}>Забронировать</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-semibold">Мои отзывы</h2>
                </div>

                <div className="space-y-4">
                  {completedBookings.filter(b => b.rating).map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <img 
                              src={booking.tourImage}
                              alt={booking.tourTitle}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div>
                              <CardTitle className="font-heading text-lg mb-1">
                                {booking.tourTitle}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mb-2">
                                <Icon name="MapPin" size={14} />
                                {booking.city}, {booking.country}
                              </CardDescription>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Icon
                                    key={i}
                                    name="Star"
                                    size={16}
                                    className={i < booking.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">{booking.date}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Отличный тур! Гид {booking.guide} профессионально провёл экскурсию, 
                          показал много интересных мест. Очень рекомендую!
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  {completedBookings.filter(b => !b.rating).length > 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Icon name="Star" size={48} className="text-muted-foreground mb-4" />
                        <h3 className="text-xl font-heading font-semibold mb-2">
                          У вас есть туры без отзывов
                        </h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Поделитесь впечатлениями о поездках и помогите другим путешественникам
                        </p>
                        <Button onClick={() => setActiveTab('bookings')}>
                          <Icon name="Edit" size={18} className="mr-2" />
                          Оставить отзыв
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl">Настройки профиля</CardTitle>
                    <CardDescription>
                      Заполните информацию о себе для удобного общения с гидами
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label>Фото профиля</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Загрузите свою фотографию
                        </p>
                        <Input type="file" accept="image/*" />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientName">Имя и фамилия *</Label>
                        <Input 
                          id="clientName" 
                          placeholder="Иван Петров"
                          value={user.name}
                          onChange={(e) => setUser({...user, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientEmail">Email *</Label>
                        <Input 
                          id="clientEmail" 
                          type="email"
                          placeholder="ivan@example.com"
                          value={user.email}
                          onChange={(e) => setUser({...user, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientPhone">Телефон</Label>
                        <Input 
                          id="clientPhone" 
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          value={user.phone}
                          onChange={(e) => setUser({...user, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientTelegram">Telegram</Label>
                        <Input 
                          id="clientTelegram" 
                          placeholder="@username"
                          value={user.telegram}
                          onChange={(e) => setUser({...user, telegram: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clientCity">Город</Label>
                      <Input 
                        id="clientCity" 
                        placeholder="Москва"
                        value={user.city}
                        onChange={(e) => setUser({...user, city: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientBio">О себе (необязательно)</Label>
                      <Textarea 
                        id="clientBio" 
                        placeholder="Расскажите о своих интересах, хобби, опыте путешествий..."
                        rows={4}
                        value={user.bio}
                        onChange={(e) => setUser({...user, bio: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientInterests">Интересы</Label>
                      <Input 
                        id="clientInterests" 
                        placeholder="История, архитектура, гастрономия, активный отдых"
                        value={user.interests}
                        onChange={(e) => setUser({...user, interests: e.target.value})}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Уведомления</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email уведомления</p>
                          <p className="text-sm text-muted-foreground">Получать письма о новых бронированиях</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="toggle" 
                          checked={user.email_notifications}
                          onChange={(e) => setUser({...user, email_notifications: e.target.checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Telegram уведомления</p>
                          <p className="text-sm text-muted-foreground">Получать сообщения в Telegram</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="toggle"
                          checked={user.telegram_notifications}
                          onChange={(e) => setUser({...user, telegram_notifications: e.target.checked})}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={handleSaveProfile} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={18} className="mr-2" />
                            Сохранить изменения
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('bookings')}>
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <footer className="bg-foreground text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Icon name="Compass" size={28} className="text-primary" />
              <span className="text-xl font-heading font-bold">ТурГид</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 ТурГид. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}