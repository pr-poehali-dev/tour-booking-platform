import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { toursApi, Tour } from '@/lib/toursApi';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [duration, setDuration] = useState('all');
  const [tours, setTours] = useState<Tour[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, [selectedCity, priceRange, searchQuery]);

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      
      if (selectedCity !== 'all') {
        filters.city = selectedCity;
      }
      
      if (priceRange[0] > 0) {
        filters.min_price = priceRange[0];
      }
      
      if (priceRange[1] < 50000) {
        filters.max_price = priceRange[1];
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      const data = await toursApi.getTours(filters);
      setTours(data.tours);
      setCities(data.cities);
    } catch (error) {
      console.error('Failed to load tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} минут`;
    if (mins === 0) return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`;
    return `${hours}ч ${mins}м`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Compass" size={32} className="text-primary" />
              <span className="text-2xl font-heading font-bold text-foreground">ТурГид</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#catalog" className="text-foreground hover:text-primary transition-colors">Каталог туров</a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">Как это работает</a>
              <a href="#faq" className="text-foreground hover:text-primary transition-colors">FAQ</a>
              <a href="#blog" className="text-foreground hover:text-primary transition-colors">Блог</a>
              <a href="#contacts" className="text-foreground hover:text-primary transition-colors">Контакты</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Личный кабинет</Link>
              </Button>
              <Button>Регистрация</Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tours[0].image})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 animate-fade-in">
            Авторские туры от местных гидов
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Откройте для себя уникальные экскурсии в любой точке мира
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Куда хотите отправиться?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 text-foreground"
                />
              </div>
              <Button className="h-12 text-base">
                <Icon name="Search" size={20} className="mr-2" />
                Найти туры
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Популярные направления</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cities.map((city, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow group">
                <CardContent className="p-6 text-center">
                  <Icon name="MapPin" size={32} className="mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <p className="font-medium">{city}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12">Каталог туров</h2>
          
          <div className="grid lg:grid-cols-4 gap-8 mb-8">
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="font-heading">Фильтры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Город</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все города</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Длительность</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Любая" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любая</SelectItem>
                      <SelectItem value="1day">1 день</SelectItem>
                      <SelectItem value="2-3days">2-3 дня</SelectItem>
                      <SelectItem value="4-7days">4-7 дней</SelectItem>
                      <SelectItem value="week+">Неделя и более</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Цена: {priceRange[0]} - {priceRange[1]} ₽
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000}
                    step={500}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Рейтинг</label>
                  <div className="flex gap-2">
                    {[5, 4, 3].map((rating) => (
                      <Badge key={rating} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                        {rating}+ <Icon name="Star" size={12} className="ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">Загрузка туров...</p>
                </div>
              ) : tours.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-muted-foreground">Туров не найдено. Попробуйте изменить фильтры.</p>
                </div>
              ) : (
                tours.map((tour) => (
                  <Link key={tour.id} to={`/tour/${tour.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={tour.image_url} 
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 right-4 bg-white text-foreground">
                          {formatDuration(tour.duration)}
                        </Badge>
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{tour.city}</Badge>
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{tour.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({tour.reviews_count})</span>
                          </div>
                        </div>
                        <CardTitle className="font-heading line-clamp-2">{tour.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{tour.short_description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Icon name="User" size={14} />
                            <span>{tour.guide_name}</span>
                          </div>
                          <div className="text-2xl font-bold text-primary">{tour.price.toLocaleString()} ₽</div>
                        </div>
                        <Button>Подробнее</Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-4">Как это работает</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Простой процесс бронирования за 3 шага</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Search" size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4">1. Выберите тур</h3>
              <p className="text-muted-foreground">Найдите идеальную экскурсию среди сотен предложений от местных гидов</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Calendar" size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4">2. Забронируйте</h3>
              <p className="text-muted-foreground">Выберите удобную дату и оплатите бронь онлайн. Гид получит уведомление</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Heart" size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4">3. Наслаждайтесь</h3>
              <p className="text-muted-foreground">Получите незабываемые впечатления и поделитесь отзывом после тура</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-heading font-bold mb-6">Станьте гидом на нашей платформе</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Делитесь своими знаниями и зарабатывайте, проводя авторские экскурсии для путешественников со всего мира
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
                  <span>Создавайте уникальные маршруты и управляйте расписанием</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
                  <span>Получайте мгновенные уведомления о новых бронированиях</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle2" size={24} className="text-primary flex-shrink-0 mt-1" />
                  <span>Общайтесь с клиентами через встроенный чат</span>
                </li>
              </ul>
              <Button size="lg" className="text-lg" asChild>
                <Link to="/guide">
                  Зарегистрироваться как гид
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={tours[0]?.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"}
                alt="Гид"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12">Вопросы и ответы</h2>
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-heading">
                Как происходит оплата бронирования?
              </AccordionTrigger>
              <AccordionContent>
                При бронировании тура вы оплачиваете процент от стоимости (обычно 20-30%) как гарантию. 
                Остальная сумма оплачивается гиду в начале тура. Все платежи защищены и проходят через безопасную систему.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-heading">
                Могу ли я отменить бронирование?
              </AccordionTrigger>
              <AccordionContent>
                Да, вы можете отменить бронирование. Условия возврата зависят от срока до начала тура: 
                более 7 дней - полный возврат, 3-7 дней - 50% возврат, менее 3 дней - без возврата. 
                Точные условия указаны в описании каждого тура.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-heading">
                Как проходит процесс модерации туров?
              </AccordionTrigger>
              <AccordionContent>
                После добавления тура наша команда проверяет описание, фотографии и информацию о гиде. 
                Модерация занимает 1-2 рабочих дня. Мы следим за качеством контента и безопасностью предложений.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-heading">
                Как я могу связаться с гидом?
              </AccordionTrigger>
              <AccordionContent>
                После подтверждения бронирования вам станет доступен встроенный чат с гидом прямо на платформе. 
                Также гид получит уведомление в Telegram и сможет оперативно отвечать на ваши вопросы.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-heading">
                Что включено в стоимость тура?
              </AccordionTrigger>
              <AccordionContent>
                Состав услуг зависит от конкретного тура. Обычно включены услуги гида, маршрут и организация. 
                Питание, проживание и входные билеты могут оплачиваться отдельно. Подробная информация указана в описании каждого тура.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section id="blog" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-heading font-bold text-center mb-12">Блог о путешествиях</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: '10 секретных мест Европы',
                excerpt: 'Откройте для себя уединённые уголки, о которых не знают толпы туристов',
                date: '15 октября 2024',
                image: tours[0].image
              },
              {
                title: 'Как выбрать идеального гида',
                excerpt: 'Советы по выбору профессионального гида для вашего путешествия',
                date: '10 октября 2024',
                image: tours[1].image
              },
              {
                title: 'Подготовка к горному походу',
                excerpt: 'Всё что нужно знать перед отправлением в многодневный горный тур',
                date: '5 октября 2024',
                image: tours[2].image
              }
            ].map((post, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Icon name="Calendar" size={14} />
                    <span>{post.date}</span>
                  </div>
                  <CardTitle className="font-heading line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="group">
                    Читать далее 
                    <Icon name="ArrowRight" size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-center mb-12">Контакты</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-heading font-semibold mb-6">Свяжитесь с нами</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Icon name="Mail" size={24} className="text-primary mt-1" />
                    <div>
                      <p className="font-medium mb-1">Email</p>
                      <a href="mailto:info@turgid.ru" className="text-primary hover:underline">info@turgid.ru</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Icon name="Phone" size={24} className="text-primary mt-1" />
                    <div>
                      <p className="font-medium mb-1">Телефон</p>
                      <a href="tel:+74951234567" className="text-primary hover:underline">+7 (495) 123-45-67</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Icon name="MapPin" size={24} className="text-primary mt-1" />
                    <div>
                      <p className="font-medium mb-1">Адрес</p>
                      <p className="text-muted-foreground">Москва, ул. Примерная, д. 1</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Напишите нам</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Ваше имя" />
                  <Input type="email" placeholder="Email" />
                  <Input placeholder="Тема сообщения" />
                  <textarea 
                    className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background resize-none"
                    placeholder="Ваше сообщение"
                  ></textarea>
                  <Button className="w-full">Отправить сообщение</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Compass" size={28} className="text-primary" />
                <span className="text-xl font-heading font-bold">ТурГид</span>
              </div>
              <p className="text-gray-400 text-sm">
                Платформа для бронирования авторских экскурсий от местных гидов
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Для туристов</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Каталог туров</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Как забронировать</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Личный кабинет</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Отзывы</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Для гидов</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Стать гидом</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Добавить тур</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Кабинет гида</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Помощь</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">О компании</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Блог</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Вакансии</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">© 2024 ТурГид. Все права защищены.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Icon name="Facebook" size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Icon name="Instagram" size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Icon name="Twitter" size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}