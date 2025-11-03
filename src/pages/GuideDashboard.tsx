import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

export default function GuideDashboard() {
  const [activeTab, setActiveTab] = useState('tours');
  const [isCreatingTour, setIsCreatingTour] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const guide = {
    name: 'Анна Новикова',
    email: 'anna.novikova@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    rating: 4.9,
    totalTours: 23,
    totalReviews: 342,
    totalEarnings: 458000,
    memberSince: 'Январь 2022'
  };

  const tours = [
    {
      id: 1,
      title: 'Исторический центр Праги',
      city: 'Прага',
      country: 'Чехия',
      price: 3500,
      duration: '1 день',
      status: 'active',
      image: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/ccd38c6a-3856-42af-b730-29c8aa56c8ea.jpg',
      bookings: 45,
      rating: 4.9,
      reviews: 127
    },
    {
      id: 2,
      title: 'Пражский Град и замки',
      city: 'Прага',
      country: 'Чехия',
      price: 4200,
      duration: '1 день',
      status: 'active',
      image: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/cd6e6544-d11b-4b3d-b500-bd94c90cbc08.jpg',
      bookings: 38,
      rating: 4.8,
      reviews: 93
    },
    {
      id: 3,
      title: 'Вечерняя Прага',
      city: 'Прага',
      country: 'Чехия',
      price: 3200,
      duration: '3 часа',
      status: 'moderation',
      image: 'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/d83244a1-dd1c-448a-8abc-9c02416fbff3.jpg',
      bookings: 0,
      rating: 0,
      reviews: 0
    }
  ];

  const bookings = [
    {
      id: 1,
      tourTitle: 'Исторический центр Праги',
      clientName: 'Иван Петров',
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
      date: '15 декабря 2024',
      time: '10:00',
      participants: 2,
      status: 'confirmed',
      price: 7000,
      contactTelegram: '@ivan_petrov'
    },
    {
      id: 2,
      tourTitle: 'Пражский Град и замки',
      clientName: 'Мария Сидорова',
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      date: '18 декабря 2024',
      time: '14:00',
      participants: 3,
      status: 'pending',
      price: 12600,
      contactTelegram: '@maria_s'
    },
    {
      id: 3,
      tourTitle: 'Исторический центр Праги',
      clientName: 'Алексей Иванов',
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexey',
      date: '20 декабря 2024',
      time: '11:00',
      participants: 4,
      status: 'confirmed',
      price: 14000,
      contactTelegram: '@alexey_iv'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      active: { label: 'Активен', variant: 'default' },
      moderation: { label: 'На модерации', variant: 'secondary' },
      draft: { label: 'Черновик', variant: 'outline' },
      pending: { label: 'Ожидает', variant: 'secondary' },
      confirmed: { label: 'Подтверждено', variant: 'default' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
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
              <Avatar>
                <AvatarImage src={guide.avatar} />
                <AvatarFallback>АН</AvatarFallback>
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
                  <AvatarImage src={guide.avatar} />
                  <AvatarFallback>АН</AvatarFallback>
                </Avatar>
                <CardTitle className="font-heading">{guide.name}</CardTitle>
                <CardDescription>{guide.email}</CardDescription>
                <div className="flex items-center justify-center gap-1 mt-3">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{guide.rating}</span>
                  <span className="text-sm text-muted-foreground">({guide.totalReviews})</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Calendar" size={16} />
                  <span>Гид с {guide.memberSince}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{guide.totalTours}</div>
                    <div className="text-xs text-muted-foreground">Туров</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{guide.totalEarnings.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Заработано ₽</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/guide/profile">
                      <Icon name="User" size={18} className="mr-2" />
                      Профиль
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/guide/settings">
                      <Icon name="Settings" size={18} className="mr-2" />
                      Настройки
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Icon name="LogOut" size={18} className="mr-2" />
                    Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-heading font-bold mb-2">Кабинет гида</h1>
                <p className="text-muted-foreground">Управляйте турами и бронированиями</p>
              </div>
              <Dialog open={isCreatingTour} onOpenChange={setIsCreatingTour}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Icon name="Plus" size={20} className="mr-2" />
                    Создать тур
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-2xl">Создать новый тур</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о туре. После проверки модератором тур появится в каталоге.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="title">Название тура *</Label>
                        <Input id="title" placeholder="Например: Исторический центр Праги" />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Город *</Label>
                          <Input id="city" placeholder="Прага" />
                        </div>
                        <div>
                          <Label htmlFor="country">Страна *</Label>
                          <Input id="country" placeholder="Чехия" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Цена (₽) *</Label>
                          <Input id="price" type="number" placeholder="3500" />
                        </div>
                        <div>
                          <Label htmlFor="duration">Длительность *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите длительность" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2-3h">2-3 часа</SelectItem>
                              <SelectItem value="half-day">Полдня</SelectItem>
                              <SelectItem value="full-day">1 день</SelectItem>
                              <SelectItem value="2-3days">2-3 дня</SelectItem>
                              <SelectItem value="week">Неделя</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Краткое описание *</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Опишите тур в 1-2 предложениях"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fullDescription">Полное описание *</Label>
                        <Textarea 
                          id="fullDescription" 
                          placeholder="Подробно опишите программу тура, что увидят туристы, что включено..."
                          rows={6}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="groupSize">Размер группы *</Label>
                          <Input id="groupSize" placeholder="до 8 человек" />
                        </div>
                        <div>
                          <Label htmlFor="languages">Языки *</Label>
                          <Input id="languages" placeholder="Русский, Английский, Чешский" />
                        </div>
                      </div>

                      <div>
                        <Label>Доступные даты</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Выберите даты, когда вы готовы провести тур
                        </p>
                        <Calendar
                          mode="multiple"
                          selected={selectedDates}
                          onSelect={(dates) => setSelectedDates(dates || [])}
                          className="rounded-md border"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Выбрано дат: {selectedDates.length}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="images">Фотографии</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Добавьте минимум 3 качественных фотографии
                        </p>
                        <Input id="images" type="file" multiple accept="image/*" />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-heading font-semibold">Дополнительные опции</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Мгновенное бронирование</Label>
                            <p className="text-sm text-muted-foreground">
                              Клиенты могут забронировать без вашего подтверждения
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Отправлять уведомления в Telegram</Label>
                            <p className="text-sm text-muted-foreground">
                              Получайте уведомления о новых бронированиях
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingTour(false)}>
                      Отмена
                    </Button>
                    <Button onClick={() => setIsCreatingTour(false)}>
                      Отправить на модерацию
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="tours" className="flex items-center gap-2">
                  <Icon name="MapPin" size={18} />
                  <span>Мои туры</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Icon name="Calendar" size={18} />
                  <span>Бронирования</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Icon name="Star" size={18} />
                  <span>Отзывы</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tours" className="space-y-6">
                <div className="grid gap-6">
                  {tours.map((tour) => (
                    <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-1/3 h-48 md:h-auto relative">
                          <img 
                            src={tour.image}
                            alt={tour.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(tour.status)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-2">{tour.city}, {tour.country}</Badge>
                                <CardTitle className="font-heading mb-1">{tour.title}</CardTitle>
                                <CardDescription className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Icon name="Clock" size={14} />
                                    {tour.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Users" size={14} />
                                    {tour.bookings} бронирований
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-3xl font-bold text-primary mb-1">
                                  {tour.price.toLocaleString()} ₽
                                </div>
                                {tour.reviews > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-semibold">{tour.rating}</span>
                                    <span className="text-xs text-muted-foreground">({tour.reviews} отзывов)</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Icon name="Edit" size={16} className="mr-2" />
                                  Редактировать
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Icon name="Calendar" size={16} className="mr-2" />
                                  Даты
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/tour/${tour.id}`}>
                                    <Icon name="Eye" size={16} className="mr-2" />
                                    Просмотр
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-semibold">
                    Активные бронирования ({bookings.length})
                  </h2>
                </div>

                <div className="grid gap-6">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={booking.clientAvatar} />
                              <AvatarFallback>КЛ</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="font-heading text-lg">
                                  {booking.clientName}
                                </CardTitle>
                                {getStatusBadge(booking.status)}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Icon name="MapPin" size={14} />
                                  <span>{booking.tourTitle}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Icon name="Calendar" size={14} />
                                  <span>{booking.date} в {booking.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Icon name="Users" size={14} />
                                  <span>{booking.participants} участников</span>
                                </div>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary mb-1">
                              {booking.price.toLocaleString()} ₽
                            </div>
                            <p className="text-xs text-muted-foreground">Общая сумма</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Icon name="MessageCircle" size={16} className="mr-2" />
                          Чат на сайте
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Send" size={16} className="mr-2" />
                          Telegram: {booking.contactTelegram}
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button size="sm" className="ml-auto">
                              <Icon name="Check" size={16} className="mr-2" />
                              Подтвердить
                            </Button>
                            <Button variant="outline" size="sm">
                              <Icon name="X" size={16} className="mr-2" />
                              Отклонить
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-heading font-semibold mb-1">Отзывы клиентов</h2>
                    <p className="text-muted-foreground">
                      Средний рейтинг: {guide.rating} из 5.0 ({guide.totalReviews} отзывов)
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      client: 'Иван Петров',
                      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
                      tour: 'Исторический центр Праги',
                      rating: 5,
                      date: '10 ноября 2024',
                      text: 'Отличная экскурсия! Анна очень интересно рассказывает об истории Праги, показала много скрытых мест. Очень рекомендую!'
                    },
                    {
                      client: 'Мария Сидорова',
                      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
                      tour: 'Пражский Град и замки',
                      rating: 5,
                      date: '5 ноября 2024',
                      text: 'Профессиональный гид, приятное общение, много полезной информации. Спасибо за прекрасный день!'
                    },
                    {
                      client: 'Алексей Иванов',
                      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexey',
                      tour: 'Исторический центр Праги',
                      rating: 4,
                      date: '1 ноября 2024',
                      text: 'Хорошая экскурсия, узнали много нового. Единственное - хотелось бы больше времени в некоторых местах.'
                    }
                  ].map((review, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback>КЛ</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="font-heading text-lg">{review.client}</CardTitle>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Icon
                                    key={i}
                                    name="Star"
                                    size={16}
                                    className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            </div>
                            <CardDescription className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Icon name="MapPin" size={14} />
                                {review.tour}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {review.date}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{review.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
