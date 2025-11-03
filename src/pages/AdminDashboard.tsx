import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toursApi, Tour } from '@/lib/toursApi';
import { moderationApi } from '@/lib/moderationApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('moderation');
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [admin, setAdmin] = useState({
    name: 'Администратор',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }

    setAdmin({
      name: userData.name || 'Администратор',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name || 'Admin'}`
    });

    loadTours();
  }, [navigate]);

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const data = await toursApi.getTours();
      setTours(data.tours);
    } catch (error) {
      console.error('Failed to load tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (tourId: number) => {
    setIsProcessing(true);
    try {
      await moderationApi.approveTour(tourId);
      alert('Тур одобрен!');
      await loadTours();
    } catch (error) {
      console.error('Failed to approve tour:', error);
      alert('Ошибка при одобрении тура');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (tour: Tour) => {
    setSelectedTour(tour);
    setIsDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedTour) return;
    setIsProcessing(true);
    try {
      await moderationApi.rejectTour(selectedTour.id, rejectReason);
      alert('Тур отклонен!');
      setIsDialogOpen(false);
      setRejectReason('');
      setSelectedTour(null);
      await loadTours();
    } catch (error) {
      console.error('Failed to reject tour:', error);
      alert('Ошибка при отклонении тура');
    } finally {
      setIsProcessing(false);
    }
  };

  const moderationTours = tours.filter(t => t.instant_booking === false);
  const activeTours = tours.filter(t => t.instant_booking === true);

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return <Badge variant="default">Активен</Badge>;
    }
    return <Badge variant="secondary">На модерации</Badge>;
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
              <Badge variant="destructive">Администратор</Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{admin.name}</span>
                <Avatar>
                  <AvatarImage src={admin.avatar} />
                  <AvatarFallback>{admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Модерация туров и управление платформой</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="moderation">
              <Icon name="ClipboardCheck" size={18} className="mr-2" />
              Модерация туров
              {moderationTours.length > 0 && (
                <Badge variant="secondary" className="ml-2">{moderationTours.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              <Icon name="CheckCircle2" size={18} className="mr-2" />
              Активные туры
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Загрузка туров...</p>
              </div>
            ) : moderationTours.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="CheckCircle2" size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-heading font-semibold mb-2">Нет туров на модерации</h3>
                  <p className="text-muted-foreground">Все туры проверены</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {moderationTours.map((tour) => (
                  <Card key={tour.id}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <img 
                          src={tour.image_url} 
                          alt={tour.title}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <CardTitle className="font-heading mb-1">{tour.title}</CardTitle>
                              <CardDescription>{tour.city}</CardDescription>
                            </div>
                            {getStatusBadge(tour.instant_booking)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                              <span>{tour.price.toLocaleString()} ₽</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Clock" size={16} className="text-muted-foreground" />
                              <span>{Math.floor(tour.duration / 60)}ч {tour.duration % 60}м</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="User" size={16} className="text-muted-foreground" />
                              <span>{tour.guide_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                              <span>{tour.rating} ({tour.reviews_count} отзывов)</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tour.short_description}
                            </p>
                          </div>

                          <div className="flex gap-3 mt-4">
                            <Button 
                              onClick={() => handleApprove(tour.id)}
                              className="flex-1"
                              disabled={isProcessing}
                            >
                              <Icon name="Check" size={18} className="mr-2" />
                              Одобрить
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleReject(tour)}
                              className="flex-1"
                              disabled={isProcessing}
                            >
                              <Icon name="X" size={18} className="mr-2" />
                              Отклонить
                            </Button>
                            <Button variant="outline" asChild>
                              <Link to={`/tour/${tour.id}`}>
                                <Icon name="Eye" size={18} className="mr-2" />
                                Просмотр
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6">
              {activeTours.map((tour) => (
                <Card key={tour.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <img 
                        src={tour.image_url} 
                        alt={tour.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="font-heading mb-1">{tour.title}</CardTitle>
                            <CardDescription>{tour.city}</CardDescription>
                          </div>
                          {getStatusBadge(tour.instant_booking)}
                        </div>
                        
                        <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                          <span>{tour.price.toLocaleString()} ₽</span>
                          <span>{tour.guide_name}</span>
                          <span>★ {tour.rating} ({tour.reviews_count})</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardDescription>Всего туров</CardDescription>
                  <CardTitle className="text-4xl font-heading">{tours.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>На модерации</CardDescription>
                  <CardTitle className="text-4xl font-heading text-orange-500">{moderationTours.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Активных</CardDescription>
                  <CardTitle className="text-4xl font-heading text-green-500">{activeTours.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить тур</DialogTitle>
            <DialogDescription>
              Укажите причину отклонения тура "{selectedTour?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <Textarea 
            placeholder="Причина отклонения..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject}
              disabled={!rejectReason.trim()}
            >
              Отклонить тур
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}