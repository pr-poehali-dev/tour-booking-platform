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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import ChatWidget from '@/components/ChatWidget';
import NotificationBell from '@/components/NotificationBell';
import { bookingApi } from '@/lib/bookingApi';
import { toursApi, CreateTourData } from '@/lib/toursApi';
import { uploadApi } from '@/lib/uploadApi';
import { profileApi } from '@/lib/profileApi';
import { useToast } from '@/hooks/use-toast';

export default function GuideDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tours');
  const [isCreatingTour, setIsCreatingTour] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingIndexes, setUploadingIndexes] = useState<Set<number>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newTourData, setNewTourData] = useState({
    title: '',
    city: '',
    country: '',
    price: '',
    duration: '',
    shortDescription: '',
    fullDescription: '',
    groupSize: '',
    languages: '',
    instantBooking: false
  });

  const [guide, setGuide] = useState({
    id: 0,
    name: 'Анна Новикова',
    email: 'anna.novikova@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    phone: '',
    telegram: '',
    city: '',
    bio: '',
    languages: '',
    experience_years: 0,
    specialization: '',
    rating: 4.9,
    totalTours: 23,
    totalReviews: 342,
    totalEarnings: 458000,
    memberSince: 'Январь 2022'
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);
    if (userData.role !== 'guide') {
      navigate('/');
      return;
    }

    setGuide({
      id: userData.id || 0,
      name: userData.name || 'Гид',
      email: userData.email || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name || 'Guide'}`,
      phone: '',
      telegram: '',
      city: '',
      bio: '',
      languages: '',
      experience_years: 0,
      specialization: '',
      rating: 4.9,
      totalTours: 23,
      totalReviews: 342,
      totalEarnings: 458000,
      memberSince: 'Январь 2022'
    });
    
    if (userData.id) {
      profileApi.getProfile(userData.id).then(profile => {
        setGuide(prev => ({
          ...prev,
          phone: profile.phone || '',
          telegram: profile.telegram || '',
          city: profile.city || '',
          bio: profile.bio || '',
          languages: profile.languages || '',
          experience_years: profile.experience_years || 0,
          specialization: profile.specialization || ''
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
    if (!guide.name || !guide.email) {
      toast({
        title: "Заполните обязательные поля",
        description: "Имя и email обязательны для заполнения",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.updateProfile({
        user_id: guide.id,
        name: guide.name,
        email: guide.email,
        phone: guide.phone,
        telegram: guide.telegram,
        city: guide.city,
        bio: guide.bio,
        languages: guide.languages,
        experience_years: guide.experience_years,
        specialization: guide.specialization
      });

      toast({
        title: "Профиль обновлён!",
        description: "Ваши данные успешно сохранены"
      });

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.name = guide.name;
        userData.email = guide.email;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentCount = uploadedImages.length;
    const newFilesArray = Array.from(files).slice(0, 15 - currentCount);

    if (newFilesArray.length === 0) {
      toast({
        title: "Достигнут лимит",
        description: "Максимум 15 фотографий",
        variant: "destructive"
      });
      return;
    }

    for (const file of newFilesArray) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Неверный формат файла",
          description: `Файл ${file.name} не является изображением`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Файл слишком большой",
          description: `${file.name} превышает 5 МБ`,
          variant: "destructive"
        });
        continue;
      }

      const tempIndex = uploadedImages.length;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setUploadedImages(prev => [...prev, previewUrl]);
      };
      reader.readAsDataURL(file);

      setUploadingIndexes(prev => new Set(prev).add(tempIndex));
      
      try {
        const result = await uploadApi.uploadImage(file);
        setUploadedImages(prev => {
          const newArr = [...prev];
          newArr[tempIndex] = result.url;
          return newArr;
        });
        toast({
          title: "Фото загружено!",
          description: `${file.name} добавлено`
        });
      } catch (error) {
        setUploadedImages(prev => prev.filter((_, i) => i !== tempIndex));
        toast({
          title: "Ошибка загрузки",
          description: error instanceof Error ? error.message : "Попробуйте еще раз",
          variant: "destructive"
        });
      } finally {
        setUploadingIndexes(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempIndex);
          return newSet;
        });
      }
    }
  };

  const handleCreateTour = async () => {
    if (!newTourData.title || !newTourData.city || !newTourData.price || !newTourData.duration || !newTourData.shortDescription || !newTourData.fullDescription) {
      toast({
        title: "Заполните все обязательные поля",
        description: "Пожалуйста, заполните все поля, отмеченные звездочкой",
        variant: "destructive"
      });
      return;
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "Загрузите фотографии",
        description: "Необходимо добавить хотя бы одно фото тура",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const durationMap: Record<string, number> = {
        '2-3h': 180,
        'half-day': 300,
        'full-day': 480,
        '2-3days': 1440,
        'week': 10080
      };

      const tourData: CreateTourData = {
        title: newTourData.title,
        city: newTourData.city,
        price: parseFloat(newTourData.price),
        duration: durationMap[newTourData.duration] || 480,
        short_description: newTourData.shortDescription,
        full_description: newTourData.fullDescription,
        instant_booking: newTourData.instantBooking,
        image_url: uploadedImages[0]
      };

      await toursApi.createTour(tourData);

      toast({
        title: "Тур создан!",
        description: "Ваш тур отправлен на модерацию. После проверки он появится в каталоге."
      });

      setIsCreatingTour(false);
      setNewTourData({
        title: '',
        city: '',
        country: '',
        price: '',
        duration: '',
        shortDescription: '',
        fullDescription: '',
        groupSize: '',
        languages: '',
        instantBooking: false
      });
      setSelectedDates([]);
      setUploadedImages([]);
      
      window.location.reload();
    } catch (error) {
      toast({
        title: "Ошибка создания тура",
        description: error instanceof Error ? error.message : "Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <NotificationBell userId={1} />
              <Avatar>
                <AvatarImage src={guide.avatar} />
                <AvatarFallback>{guide.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
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
                  <AvatarFallback>{guide.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
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
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleLogout}>
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
                        <Input 
                          id="title" 
                          placeholder="Например: Исторический центр Праги"
                          value={newTourData.title}
                          onChange={(e) => setNewTourData({...newTourData, title: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Город *</Label>
                          <Input 
                            id="city" 
                            placeholder="Прага"
                            value={newTourData.city}
                            onChange={(e) => setNewTourData({...newTourData, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Страна *</Label>
                          <Input 
                            id="country" 
                            placeholder="Чехия"
                            value={newTourData.country}
                            onChange={(e) => setNewTourData({...newTourData, country: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Цена (₽) *</Label>
                          <Input 
                            id="price" 
                            type="number" 
                            placeholder="3500"
                            value={newTourData.price}
                            onChange={(e) => setNewTourData({...newTourData, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Длительность *</Label>
                          <Select value={newTourData.duration} onValueChange={(value) => setNewTourData({...newTourData, duration: value})}>
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
                          value={newTourData.shortDescription}
                          onChange={(e) => setNewTourData({...newTourData, shortDescription: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fullDescription">Полное описание *</Label>
                        <Textarea 
                          id="fullDescription" 
                          placeholder="Подробно опишите программу тура, что увидят туристы, что включено..."
                          rows={6}
                          value={newTourData.fullDescription}
                          onChange={(e) => setNewTourData({...newTourData, fullDescription: e.target.value})}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="groupSize">Размер группы *</Label>
                          <Input 
                            id="groupSize" 
                            placeholder="до 8 человек"
                            value={newTourData.groupSize}
                            onChange={(e) => setNewTourData({...newTourData, groupSize: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="languages">Языки *</Label>
                          <Input 
                            id="languages" 
                            placeholder="Русский, Английский, Чешский"
                            value={newTourData.languages}
                            onChange={(e) => setNewTourData({...newTourData, languages: e.target.value})}
                          />
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
                        <Label htmlFor="images">Фотографии тура * (до 15 фото)</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Загрузите качественные фотографии (до 5 МБ каждая). Можно выбрать несколько.
                        </p>
                        <Input 
                          id="images" 
                          type="file" 
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploadedImages.length >= 15 || uploadingIndexes.size > 0}
                        />
                        {uploadedImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            {uploadedImages.map((url, index) => (
                              <div 
                                key={index} 
                                className="relative group cursor-move"
                                draggable={!uploadingIndexes.has(index)}
                                onDragStart={() => setDraggedIndex(index)}
                                onDragEnd={() => setDraggedIndex(null)}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (draggedIndex !== null && draggedIndex !== index) {
                                    const newImages = [...uploadedImages];
                                    const draggedItem = newImages[draggedIndex];
                                    newImages.splice(draggedIndex, 1);
                                    newImages.splice(index, 0, draggedItem);
                                    setUploadedImages(newImages);
                                    setDraggedIndex(index);
                                  }
                                }}
                              >
                                <img 
                                  src={url} 
                                  alt={`Фото ${index + 1}`} 
                                  className={`w-full h-32 object-cover rounded-lg border transition-opacity ${draggedIndex === index ? 'opacity-50' : ''}`}
                                />
                                {uploadingIndexes.has(index) && (
                                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                    <Icon name="Loader2" size={24} className="animate-spin text-white" />
                                  </div>
                                )}
                                {!uploadingIndexes.has(index) && (
                                  <>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-7 w-7 p-0"
                                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                                      >
                                        <Icon name="X" size={14} />
                                      </Button>
                                    </div>
                                    {index === 0 && (
                                      <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                        Главное фото
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Загружено: {uploadedImages.length} / 15 фото. Перетаскивайте фото для изменения порядка.
                        </p>
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
                          <Switch 
                            checked={newTourData.instantBooking}
                            onCheckedChange={(checked) => setNewTourData({...newTourData, instantBooking: checked})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreatingTour(false);
                        setUploadedImageUrl('');
                      }} 
                      disabled={isSubmitting}
                    >
                      Отмена
                    </Button>
                    <Button onClick={handleCreateTour} disabled={isSubmitting || isUploadingImage}>
                      {isSubmitting ? (
                        <>
                          <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : 'Отправить на модерацию'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
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
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Icon name="User" size={18} />
                  <span>Профиль</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tours" className="space-y-6">
                <div className="grid gap-6">
                  {tours.map((tour) => (
                    <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-1/3 h-48 md:h-auto relative">
                          <img 
                            src={tour.image_url || tour.image}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedBookingId(selectedBookingId === booking.id ? null : booking.id)}
                        >
                          <Icon name="MessageCircle" size={16} className="mr-2" />
                          {selectedBookingId === booking.id ? 'Закрыть чат' : 'Чат на сайте'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Send" size={16} className="mr-2" />
                          Telegram: {booking.contactTelegram}
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="ml-auto"
                              onClick={async () => {
                                try {
                                  await bookingApi.confirmBooking(booking.id);
                                  window.location.reload();
                                } catch (error) {
                                  console.error('Failed to confirm booking:', error);
                                }
                              }}
                            >
                              <Icon name="Check" size={16} className="mr-2" />
                              Подтвердить
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  await bookingApi.cancelBooking(booking.id);
                                  window.location.reload();
                                } catch (error) {
                                  console.error('Failed to cancel booking:', error);
                                }
                              }}
                            >
                              <Icon name="X" size={16} className="mr-2" />
                              Отклонить
                            </Button>
                          </>
                        )}
                      </CardFooter>
                      {selectedBookingId === booking.id && (
                        <div className="border-t p-4">
                          <ChatWidget
                            bookingId={booking.id}
                            currentUserId={1}
                            currentUserName={guide.name}
                            otherUserName={booking.clientName}
                          />
                        </div>
                      )}
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

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl">Настройки профиля</CardTitle>
                    <CardDescription>
                      Заполните информацию о себе, чтобы клиенты могли узнать вас лучше
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={guide.avatar} />
                        <AvatarFallback>{guide.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
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
                        <Label htmlFor="guideName">Имя и фамилия *</Label>
                        <Input 
                          id="guideName" 
                          placeholder="Анна Новикова"
                          value={guide.name}
                          onChange={(e) => setGuide({...guide, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="guideEmail">Email *</Label>
                        <Input 
                          id="guideEmail" 
                          type="email"
                          placeholder="anna@example.com"
                          value={guide.email}
                          onChange={(e) => setGuide({...guide, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guidePhone">Телефон</Label>
                        <Input 
                          id="guidePhone" 
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          value={guide.phone}
                          onChange={(e) => setGuide({...guide, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="guideTelegram">Telegram</Label>
                        <Input 
                          id="guideTelegram" 
                          placeholder="@username"
                          value={guide.telegram}
                          onChange={(e) => setGuide({...guide, telegram: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="guideCity">Город</Label>
                      <Input 
                        id="guideCity" 
                        placeholder="Москва"
                        value={guide.city}
                        onChange={(e) => setGuide({...guide, city: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="guideBio">О себе</Label>
                      <Textarea 
                        id="guideBio" 
                        placeholder="Расскажите о своём опыте работы гидом, интересах, специализации..."
                        rows={5}
                        value={guide.bio}
                        onChange={(e) => setGuide({...guide, bio: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="guideLanguages">Языки</Label>
                      <Input 
                        id="guideLanguages" 
                        placeholder="Русский, Английский, Испанский"
                        value={guide.languages}
                        onChange={(e) => setGuide({...guide, languages: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="guideExperience">Опыт работы (лет)</Label>
                      <Input 
                        id="guideExperience" 
                        type="number"
                        placeholder="5"
                        value={guide.experience_years || ''}
                        onChange={(e) => setGuide({...guide, experience_years: parseInt(e.target.value) || 0})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="guideSpecialization">Специализация</Label>
                      <Textarea 
                        id="guideSpecialization" 
                        placeholder="Исторические туры, гастрономические экскурсии, походы..."
                        rows={3}
                        value={guide.specialization}
                        onChange={(e) => setGuide({...guide, specialization: e.target.value})}
                      />
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
                      <Button variant="outline" onClick={() => setActiveTab('tours')}>
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