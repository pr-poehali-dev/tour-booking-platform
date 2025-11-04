import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Booking {
  id: number;
  tourId: number;
  tourName: string;
  tourImage: string;
  guideName: string;
  date: string;
  time: string;
  participants: number;
  price: number;
  status: string;
  location: string;
}

interface BookingsTabProps {
  upcomingBookings: Booking[];
  completedBookings: Booking[];
  selectedBookingId: number | null;
  onSelectBooking: (id: number) => void;
  getStatusBadge: (status: string) => JSX.Element;
}

export default function BookingsTab({ 
  upcomingBookings, 
  completedBookings, 
  selectedBookingId, 
  onSelectBooking,
  getStatusBadge 
}: BookingsTabProps) {
  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className={selectedBookingId === booking.id ? 'ring-2 ring-primary' : ''}>
      <div className="md:flex">
        <div className="md:w-1/3">
          <img src={booking.tourImage} alt={booking.tourName} className="w-full h-48 object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
        </div>
        <div className="md:w-2/3">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="font-heading">{booking.tourName}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Icon name="MapPin" size={14} />
                  {booking.location}
                </CardDescription>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="User" size={16} className="text-muted-foreground" />
              <span>Гид: {booking.guideName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <span>{booking.date} в {booking.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Users" size={16} className="text-muted-foreground" />
              <span>{booking.participants} {booking.participants === 1 ? 'участник' : 'участника'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Icon name="Wallet" size={16} />
              <span>{booking.price.toLocaleString()} ₽</span>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => onSelectBooking(booking.id)}>
              <Icon name="MessageSquare" size={16} className="mr-2" />
              Написать гиду
            </Button>
            {booking.status === 'upcoming' && (
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Icon name="X" size={16} className="mr-2" />
                Отменить
              </Button>
            )}
            {booking.status === 'completed' && (
              <Button variant="outline" size="sm">
                <Icon name="Star" size={16} className="mr-2" />
                Оставить отзыв
              </Button>
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-heading font-bold mb-4">Предстоящие туры</h2>
          <div className="space-y-4">
            {upcomingBookings.map(renderBookingCard)}
          </div>
        </div>
      )}

      {completedBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-heading font-bold mb-4">Завершенные туры</h2>
          <div className="space-y-4">
            {completedBookings.map(renderBookingCard)}
          </div>
        </div>
      )}

      {upcomingBookings.length === 0 && completedBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Icon name="Calendar" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">У вас пока нет бронирований</h3>
          <p className="text-muted-foreground mb-6">Начните исследовать наши туры и забронируйте первое приключение!</p>
          <Button>
            <Icon name="Search" size={18} className="mr-2" />
            Найти тур
          </Button>
        </div>
      )}
    </div>
  );
}
