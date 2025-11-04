import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Favorite {
  id: number;
  tourId: number;
  tourName: string;
  tourImage: string;
  guideName: string;
  price: number;
  duration: string;
  location: string;
  rating: number;
  reviews: number;
}

interface FavoritesTabProps {
  favorites: Favorite[];
  onRemoveFavorite?: (id: number) => void;
}

export default function FavoritesTab({ favorites, onRemoveFavorite }: FavoritesTabProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Icon name="Heart" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">У вас нет избранных туров</h3>
        <p className="text-muted-foreground mb-6">Добавляйте понравившиеся туры в избранное, чтобы быстро находить их позже</p>
        <Button>
          <Icon name="Search" size={18} className="mr-2" />
          Найти тур
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img src={favorite.tourImage} alt={favorite.tourName} className="w-full h-48 object-cover" />
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute top-2 right-2 rounded-full"
              onClick={() => onRemoveFavorite?.(favorite.id)}
            >
              <Icon name="Heart" size={18} className="fill-current text-red-500" />
            </Button>
          </div>
          <CardHeader>
            <CardTitle className="font-heading line-clamp-2">{favorite.tourName}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Icon name="MapPin" size={14} />
              {favorite.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="User" size={16} className="text-muted-foreground" />
              <span>{favorite.guideName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span>{favorite.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Icon name="Star" size={12} className="fill-current text-yellow-500" />
                {favorite.rating}
              </Badge>
              <span className="text-sm text-muted-foreground">({favorite.reviews} отзывов)</span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold text-primary">{favorite.price.toLocaleString()} ₽</div>
              <div className="text-sm text-muted-foreground">за человека</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link to={`/tour/${favorite.tourId}`}>
                Подробнее
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
