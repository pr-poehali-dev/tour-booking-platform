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
  const [tourImages, setTourImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  
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

    const currentImageCount = tourImages.length;
    const filesToUpload = Array.from(files).slice(0, 15 - currentImageCount);

    if (filesToUpload.length === 0) {
      toast({
        title: "Достигнут лимит",
        description: "Максимум 15 фотографий",
        variant: "destructive"
      });
      return;
    }

    for (let fileIdx = 0; fileIdx < filesToUpload.length; fileIdx++) {
      const currentFile = filesToUpload[fileIdx];
      
      if (!currentFile.type.startsWith('image/')) {
        toast({
          title: "Неверный формат файла",
          description: `Файл ${currentFile.name} не является изображением`,
          variant: "destructive"
        });
        continue;
      }

      if (currentFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Файл слишком большой",
          description: `${currentFile.name} превышает 5 МБ`,
          variant: "destructive"
        });
        continue;
      }

      const targetIndex = tourImages.length + fileIdx;
      
      const fileReaderInstance = new FileReader();
      fileReaderInstance.onloadend = () => {
        const previewDataUrl = fileReaderInstance.result as string;
        setTourImages(prevImgs => [...prevImgs, previewDataUrl]);
      };
      fileReaderInstance.readAsDataURL(currentFile);

      setUploadingImages(prevSet => {
        const newSet = new Set(prevSet);
        newSet.add(targetIndex);
        return newSet;
      });
      
      try {
        const uploadedData = await uploadApi.uploadImage(currentFile);
        setTourImages(prevImgs => {
          const updatedImgs = [...prevImgs];
          updatedImgs[targetIndex] = uploadedData.url;
          return updatedImgs;
        });
        toast({
          title: "Фото загружено!",
          description: `${currentFile.name} добавлено`
        });
      } catch (uploadError) {
        setTourImages(prevImgs => prevImgs.filter((_, idx) => idx !== targetIndex));
        toast({
          title: "Ошибка загрузки",
          description: uploadError instanceof Error ? uploadError.message : "Попробуйте еще раз",
          variant: "destructive"
        });
      } finally {
        setUploadingImages(prevSet => {
          const newSet = new Set(prevSet);
          newSet.delete(targetIndex);
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

    if (tourImages.length === 0) {
      toast({
        title: "Загрузите фотографии",
        description: "Необходимо добавить хотя бы одно фото тура",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const tourData: CreateTourData = {
        title: newTourData.title,
        city: newTourData.city,
        country: newTourData.country,
        price: parseFloat(newTourData.price),
        duration: newTourData.duration,
        short_description: newTourData.shortDescription,
        full_description: newTourData.fullDescription,
        group_size: newTourData.groupSize ? parseInt(newTourData.groupSize) : 10,
        languages: newTourData.languages || 'Русский',
        instant_booking: newTourData.instantBooking,
        guide_id: guide.id,
        image_url: tourImages[0],
        images: tourImages
      };

      await toursApi.createTour(tourData);

      toast({
        title: "Тур создан!",
        description: "Ваш тур отправлен на модерацию"
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
      setTourImages([]);
      setActiveTab('tours');
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

  const handleBookingAction = async (bookingId: number, action: 'accept' | 'reject') => {
    setIsSubmitting(true);
    try {
      if (action === 'accept') {
        await bookingApi.confirmBooking(bookingId);
        toast({
          title: "Бронирование подтверждено!",
          description: "Клиент получит уведомление"
        });
      } else {
        await bookingApi.rejectBooking(bookingId);
        toast({
          title: "Бронирование отклонено",
          description: "Клиент получит уведомление"
        });
      }
      setSelectedBookingId(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [tours, setTours] = useState([
    {
      id: 1,
      title: 'Экскурсия по Красной площади',
      city: 'Москва',
      country: 'Россия',
      price: 3500,
      duration: '3 часа',
      image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400',
      image_url: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400',
      rating: 4.8,
      bookings: 45,
      status: 'active'
    },
    {
      id: 2,
      title: 'Ночная Москва',
      city: 'Москва',
      country: 'Россия',
      price: 4200,
      duration: '4 часа',
      image: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=400',
      image_url: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=400',
      rating: 4.9,
      bookings: 38,
      status: 'active'
    }
  ]);

  useEffect(() => {
    toursApi.getToursByGuide(guide.id).then(fetchedTours => {
      if (fetchedTours.length > 0) {
        setTours(fetchedTours);
      }
    }).catch(console.error);
  }, [guide.id]);

  const bookings = [
    {
      id: 1,
      tourTitle: 'Экскурсия по Красной площади',
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
      tourTitle: 'Ночная Москва',
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

  const reviews = [
    {
      id: 1,
      tourTitle: 'Экскурсия по Красной площади',
      clientName: 'Иван Петров',
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
      rating: 5,
      date: '10 декабря 2024',
      text: 'Отличная экскурсия! Гид очень интересно рассказывал об истории Москвы.'
    },
    {
      id: 2,
      tourTitle: 'Ночная Москва',
      clientName: 'Мария Сидорова',
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      rating: 5,
      date: '8 декабря 2024',
      text: 'Незабываемые впечатления! Рекомендую всем!'
    },
    {
      id: 3,
      tourTitle: 'Экскурсия по Красной площади',
      clientName: 'Алексей Иванов',
      clientAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexey',
      rating: 4,
      date: '5 декабря 2024',
      text: 'Хорошая экскурсия, но хотелось бы больше времени для фотографий.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Icon name="Compass" size={28} className="text-primary" />
              <span className="font-heading text-xl font-bold">TourGuide</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ChatWidget />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <Icon name="LogOut" size={20} />
            </Button>
            <Avatar>
              <AvatarImage src={guide.avatar} alt={guide.name} />
              <AvatarFallback>{guide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-2">Добро пожаловать, {guide.name}!</h1>
              <p className="text-muted-foreground">Управляйте своими турами и бронированиями</p>
            </div>
            <Button 
              size="lg" 
              onClick={() => {
                setIsCreatingTour(true);
                setActiveTab('tours');
              }}
              className="gap-2"
            >
              <Icon name="Plus" size={20} />
              Создать тур
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Активных туров</CardDescription>
                <CardTitle className="text-3xl font-heading">{guide.totalTours}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Всего отзывов</CardDescription>
                <CardTitle className="text-3xl font-heading">{guide.totalReviews}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Рейтинг</CardDescription>
                <CardTitle className="text-3xl font-heading flex items-center gap-2">
                  {guide.rating}
                  <Icon name="Star" size={24} className="text-yellow-500 fill-yellow-500" />
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Общий доход</CardDescription>
                <CardTitle className="text-3xl font-heading">₽{guide.totalEarnings.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        {isCreatingTour && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading">Создание нового тура</CardTitle>
                  <CardDescription>Заполните информацию о туре</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsCreatingTour(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Название тура *</Label>
                  <Input 
                    id="title" 
                    placeholder="Экскурсия по Красной площади"
                    value={newTourData.title}
                    onChange={(e) => setNewTourData({...newTourData, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Город *</Label>
                  <Input 
                    id="city" 
                    placeholder="Москва"
                    value={newTourData.city}
                    onChange={(e) => setNewTourData({...newTourData, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Страна *</Label>
                  <Input 
                    id="country" 
                    placeholder="Россия"
                    value={newTourData.country}
                    onChange={(e) => setNewTourData({...newTourData, country: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Цена за человека (₽) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="3500"
                    value={newTourData.price}
                    onChange={(e) => setNewTourData({...newTourData, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Продолжительность *</Label>
                  <Input 
                    id="duration" 
                    placeholder="3 часа"
                    value={newTourData.duration}
                    onChange={(e) => setNewTourData({...newTourData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="groupSize">Размер группы</Label>
                  <Input 
                    id="groupSize" 
                    type="number" 
                    placeholder="10"
                    value={newTourData.groupSize}
                    onChange={(e) => setNewTourData({...newTourData, groupSize: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="languages">Языки</Label>
                <Input 
                  id="languages" 
                  placeholder="Русский, English"
                  value={newTourData.languages}
                  onChange={(e) => setNewTourData({...newTourData, languages: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Краткое описание *</Label>
                <Textarea 
                  id="shortDescription" 
                  placeholder="Краткое описание тура (2-3 предложения)"
                  rows={3}
                  value={newTourData.shortDescription}
                  onChange={(e) => setNewTourData({...newTourData, shortDescription: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Это описание будет отображаться в карточке тура
                </p>
              </div>

              <div>
                <Label htmlFor="fullDescription">Полное описание *</Label>
                <Textarea 
                  id="fullDescription" 
                  placeholder="Подробное описание тура, что включено, что посетим и т.д."
                  rows={6}
                  value={newTourData.fullDescription}
                  onChange={(e) => setNewTourData({...newTourData, fullDescription: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Расскажите подробно о программе тура, достопримечательностях и что включено в стоимость
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
                  disabled={tourImages.length >= 15 || uploadingImages.size > 0}
                />
                {tourImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {tourImages.map((imgUrl, imgIndex) => (
                      <div 
                        key={imgIndex} 
                        className="relative group cursor-move"
                        draggable={!uploadingImages.has(imgIndex)}
                        onDragStart={() => setDraggedImageIndex(imgIndex)}
                        onDragEnd={() => setDraggedImageIndex(null)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedImageIndex !== null && draggedImageIndex !== imgIndex) {
                            const newImagesArray = [...tourImages];
                            const draggedItem = newImagesArray[draggedImageIndex];
                            newImagesArray.splice(draggedImageIndex, 1);
                            newImagesArray.splice(imgIndex, 0, draggedItem);
                            setTourImages(newImagesArray);
                            setDraggedImageIndex(imgIndex);
                          }
                        }}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Фото ${imgIndex + 1}`} 
                          className={`w-full h-32 object-cover rounded-lg border transition-opacity ${draggedImageIndex === imgIndex ? 'opacity-50' : ''}`}
                        />
                        {uploadingImages.has(imgIndex) && (
                          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                            <Icon name="Loader2" size={24} className="animate-spin text-white" />
                          </div>
                        )}
                        {!uploadingImages.has(imgIndex) && (
                          <>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 w-7 p-0"
                                onClick={() => setTourImages(prev => prev.filter((_, i) => i !== imgIndex))}
                              >
                                <Icon name="X" size={14} />
                              </Button>
                            </div>
                            {imgIndex === 0 && (
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
                  Загружено: {tourImages.length} / 15 фото. Перетаскивайте фото для изменения порядка.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-heading font-semibold">Дополнительные опции</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="instantBooking">Мгновенное бронирование</Label>
                    <p className="text-sm text-muted-foreground">
                      Клиенты могут забронировать тур без вашего подтверждения
                    </p>
                  </div>
                  <Switch
                    id="instantBooking"
                    checked={newTourData.instantBooking}
                    onCheckedChange={(checked) => setNewTourData({...newTourData, instantBooking: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateTour} 
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="Loader2" size={18} className="animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Icon name="Check" size={18} />
                      Создать тур
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingTour(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
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
                                <span className="flex items-center gap-1">
                                  <Icon name="Star" size={14} className="fill-yellow-500 text-yellow-500" />
                                  {tour.rating}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between">
                          <div>
                            <span className="text-3xl font-heading font-bold">₽{tour.price.toLocaleString()}</span>
                            <span className="text-muted-foreground ml-2">за человека</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Icon name="BarChart" size={16} />
                            </Button>
                          </div>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={booking.clientAvatar} alt={booking.clientName} />
                            <AvatarFallback>{booking.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="font-heading text-lg">{booking.clientName}</CardTitle>
                              {getStatusBadge(booking.status)}
                            </div>
                            <CardDescription className="mb-2">{booking.tourTitle}</CardDescription>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {booking.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Clock" size={14} />
                                {booking.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Users" size={14} />
                                {booking.participants} чел.
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-heading font-bold">₽{booking.price.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex gap-3">
                      {booking.status === 'pending' && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setSelectedBookingId(booking.id)}>
                                <Icon name="Check" size={16} className="mr-2" />
                                Принять
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Подтвердить бронирование?</DialogTitle>
                                <DialogDescription>
                                  Вы подтверждаете бронирование для {booking.clientName} на {booking.date} в {booking.time}.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedBookingId(null)}>
                                  Отмена
                                </Button>
                                <Button onClick={() => handleBookingAction(booking.id, 'accept')} disabled={isSubmitting}>
                                  {isSubmitting ? 'Подтверждение...' : 'Подтвердить'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" onClick={() => handleBookingAction(booking.id, 'reject')}>
                            <Icon name="X" size={16} className="mr-2" />
                            Отклонить
                          </Button>
                        </>
                      )}
                      <Button variant="outline" asChild>
                        <a href={`https://t.me/${booking.contactTelegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Icon name="MessageCircle" size={16} className="mr-2" />
                          Написать в Telegram
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.clientAvatar} alt={review.clientName} />
                          <AvatarFallback>{review.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="font-heading text-lg">{review.clientName}</CardTitle>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Icon key={i} name="Star" size={16} className="fill-yellow-500 text-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <CardDescription className="mb-2">{review.tourTitle}</CardDescription>
                          <p className="text-sm mb-2">{review.text}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Личная информация</CardTitle>
                  <CardDescription>Обновите вашу контактную информацию</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Имя *</Label>
                      <Input 
                        id="name" 
                        value={guide.name}
                        onChange={(e) => setGuide({...guide, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={guide.email}
                        onChange={(e) => setGuide({...guide, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+7 (999) 123-45-67"
                        value={guide.phone}
                        onChange={(e) => setGuide({...guide, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input 
                        id="telegram" 
                        placeholder="@username"
                        value={guide.telegram}
                        onChange={(e) => setGuide({...guide, telegram: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city">Город</Label>
                    <Input 
                      id="city" 
                      placeholder="Москва"
                      value={guide.city}
                      onChange={(e) => setGuide({...guide, city: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="languages">Языки</Label>
                    <Input 
                      id="languages" 
                      placeholder="Русский, English, Español"
                      value={guide.languages}
                      onChange={(e) => setGuide({...guide, languages: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Опыт работы (лет)</Label>
                    <Input 
                      id="experience" 
                      type="number"
                      value={guide.experience_years}
                      onChange={(e) => setGuide({...guide, experience_years: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization">Специализация</Label>
                    <Input 
                      id="specialization" 
                      placeholder="Исторические туры, Архитектура"
                      value={guide.specialization}
                      onChange={(e) => setGuide({...guide, specialization: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Расскажите о себе..."
                      rows={4}
                      value={guide.bio}
                      onChange={(e) => setGuide({...guide, bio: e.target.value})}
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Icon name="Loader2" size={18} className="animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Icon name="Save" size={18} />
                        Сохранить изменения
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
