import { Book as BookIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/lib/api';
import { Link } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  onBorrow?: (bookId: number) => void;
  isLoading?: boolean;
}

const BookCard = ({ book, onBorrow, isLoading }: BookCardProps) => {
  return (
    <Card className="p-6 gradient-card hover:shadow-hover transition-smooth group">
      <div className="flex items-start gap-4">
        <div className="w-16 h-20 bg-accent/20 rounded flex items-center justify-center flex-shrink-0 group-hover:bg-accent/30 transition-smooth">
          <BookIcon className="h-8 w-8 text-accent" />
        </div>
        
        <div className="flex-1 min-w-0">
          <Link to={`/book/${book.id}`}>
            <h3 className="font-semibold text-lg mb-1 hover:text-accent transition-smooth truncate">
              {book.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-2">par {book.author}</p>
          
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant={book.available ? 'default' : 'secondary'} className="text-xs">
              {book.available ? 'Disponible' : 'Emprunté'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {book.genre}
            </Badge>
          </div>

          {book.available && onBorrow && book.id && (
            <Button
              size="sm"
              onClick={() => onBorrow(book.id!)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Emprunter
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookCard;
