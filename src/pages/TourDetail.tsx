import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

export default function TourDetail() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'guide',
      text: 'Здравствуйте! Спасибо за интерес к моему туру. Чем могу помочь?',
      time: '14:30',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna'
    }
  ]);

  const tour = {
    id: 1,
    title: 'Исторический центр Праги',
    city: 'Прага',
    country: 'Чехия',
    duration: '1 день',
    price: 3500,
    rating: 4.9,
    reviews: 127,
    images: [
      'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/ccd38c6a-3856-42af-b730-29c8aa56c8ea.jpg',
      'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/cd6e6544-d11b-4b3d-b500-bd94c90cbc08.jpg',
      'https://cdn.poehali.dev/projects/b1188c50-41f2-4090-868c-d1ee76f9086f/files/d83244a1-dd1c-448a-8abc-9c02416fbff3.jpg'
    ],
    guide: {
      name: 'Анна Новикова',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
      rating: 4.9,
      toursCount: 23,
      bio: 'Профессиональный гид с 8-летним стажем. Влюблена в историю Праги и делюсь этой любовью с гостями города.'
    },
    description: 'Прогуляйтесь по мощёным улочкам Старого города и откройте для себя скрытые жемчужины Праги. Это не обычная экскурсия - я покажу вам места, о которых знают только местные жители.',
    fullDescription: 'Этот тур - настоящее погружение в атмосферу средневековой Праги. Мы пройдём по самым живописным улочкам, посетим старинные дворы, узнаем легенды и истории, которые не найдёте в путеводителях.\n\nВы увидите:\n- Староместскую площадь и астрономические часы\n- Карлов мост и его статуи\n- Еврейский квартал Йозефов\n- Скрытые дворики и пассажи\n- Лучшие смотровые площадки\n\nМаршрут адаптирую под ваши интересы!',
    includes: [
      'Услуги профессионального гида',
      'Маршрут по 15+ локациям',
      'Исторические факты и легенды',
      'Рекомендации по ресторанам',
      'Помощь с фотографиями'
    ],
    notIncludes: [
      'Входные билеты в музеи',
      'Питание',
      'Личные расходы'
    ],
    groupSize: 'до 8 человек',
    languages: ['Русский', 'Английский', 'Чешский'],
    availableDates: [5, 7, 12, 15, 18, 20, 22, 25, 28]
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: chatMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
    };
    
    setMessages([...messages, newMessage]);
    setChatMessage('');
  };

  const isDateAvailable = (date: Date) => {
    return tour.availableDates.includes(date.getDate());
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
              <Button variant="ghost">Войти</Button>
              <Button>Регистрация</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <Icon name="ArrowLeft" size={20} />
          <span>Вернуться к каталогу</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 h-96 rounded-2xl overflow-hidden">
                <img 
                  src={tour.images[0]}
                  alt={tour.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {tour.images.slice(1).map((img, index) => (
                <div key={index} className="h-48 rounded-xl overflow-hidden cursor-pointer">
                  <img 
                    src={img}
                    alt={`${tour.title} ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tour.city}, {tour.country}</Badge>
                    <Badge>{tour.duration}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{tour.rating}</span>
                    <span className="text-sm text-muted-foreground">({tour.reviews} отзывов)</span>
                  </div>
                </div>
                <CardTitle className="text-4xl font-heading">{tour.title}</CardTitle>
                <CardDescription className="text-lg">{tour.description}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading">О туре</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Описание</TabsTrigger>
                    <TabsTrigger value="includes">Что включено</TabsTrigger>
                    <TabsTrigger value="details">Детали</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="space-y-4 mt-6">
                    <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      {tour.fullDescription}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="includes" className="space-y-6 mt-6">
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Icon name="Check" size={20} className="text-green-600" />
                        Включено в стоимость
                      </h4>
                      <ul className="space-y-3">
                        {tour.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-3 text-muted-foreground">
                            <Icon name="CheckCircle2" size={18} className="text-primary mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Icon name="X" size={20} className="text-red-600" />
                        Не включено в стоимость
                      </h4>
                      <ul className="space-y-3">
                        {tour.notIncludes.map((item, index) => (
                          <li key={index} className="flex items-start gap-3 text-muted-foreground">
                            <Icon name="XCircle" size={18} className="text-muted-foreground mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4 mt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Icon name="Users" size={20} className="text-primary mt-1" />
                        <div>
                          <p className="font-medium">Размер группы</p>
                          <p className="text-sm text-muted-foreground">{tour.groupSize}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Icon name="Languages" size={20} className="text-primary mt-1" />
                        <div>
                          <p className="font-medium">Языки</p>
                          <p className="text-sm text-muted-foreground">{tour.languages.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Icon name="Clock" size={20} className="text-primary mt-1" />
                        <div>
                          <p className="font-medium">Длительность</p>
                          <p className="text-sm text-muted-foreground">{tour.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Icon name="MapPin" size={20} className="text-primary mt-1" />
                        <div>
                          <p className="font-medium">Место встречи</p>
                          <p className="text-sm text-muted-foreground">Староместская площадь</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Ваш гид</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={tour.guide.avatar} />
                    <AvatarFallback>АН</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-semibold mb-2">{tour.guide.name}</h3>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{tour.guide.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Icon name="MapPin" size={14} />
                        <span>{tour.guide.toursCount} туров</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{tour.guide.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-1">
                      {tour.price.toLocaleString()} ₽
                    </div>
                    <p className="text-sm text-muted-foreground">за человека</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Icon name="Heart" size={24} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Выберите дату</label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => !isDateAvailable(date)}
                    modifiers={{
                      available: (date) => isDateAvailable(date)
                    }}
                    modifiersStyles={{
                      available: { fontWeight: 'bold', color: 'hsl(var(--primary))' }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    <Icon name="Info" size={12} className="inline mr-1" />
                    Выделены доступные даты
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="MessageCircle" size={18} className="text-primary" />
                    Чат с гидом
                  </h4>
                  <Card className="border-2">
                    <ScrollArea className="h-64 p-4">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={msg.avatar} />
                              <AvatarFallback>{msg.sender === 'guide' ? 'Г' : 'Я'}</AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : ''}`}>
                              <div
                                className={`rounded-2xl px-4 py-2 max-w-xs ${
                                  msg.sender === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-foreground'
                                }`}
                              >
                                <p className="text-sm">{msg.text}</p>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Напишите сообщение..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button size="icon" onClick={handleSendMessage}>
                          <Icon name="Send" size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>

                <Separator />

                <Button className="w-full h-12 text-base" size="lg">
                  <Icon name="Calendar" size={20} className="mr-2" />
                  Забронировать тур
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  При бронировании оплачивается 30% стоимости
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-heading font-bold mb-8">Похожие туры</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Пражский Град и замки',
                city: 'Прага',
                price: 4200,
                rating: 4.8,
                image: tour.images[1]
              },
              {
                title: 'Велосипедный тур по набережной',
                city: 'Прага',
                price: 2800,
                rating: 4.9,
                image: tour.images[2]
              },
              {
                title: 'Гастрономический тур',
                city: 'Прага',
                price: 5500,
                rating: 5.0,
                image: tour.images[0]
              }
            ].map((similarTour, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                <div className="h-48 overflow-hidden">
                  <img
                    src={similarTour.image}
                    alt={similarTour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{similarTour.city}</Badge>
                    <div className="flex items-center gap-1">
                      <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold">{similarTour.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="font-heading text-lg line-clamp-2">
                    {similarTour.title}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <div className="text-xl font-bold text-primary">
                    {similarTour.price.toLocaleString()} ₽
                  </div>
                  <Button size="sm">Подробнее</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
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
