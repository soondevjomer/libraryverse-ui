import { Book } from './book.model';

export interface LibraryStat {
  totalBooks: number;
  totalLowOnStock: number;
}

export interface Library {
  id: number;
  name: string;
  address?: string;
  contactNumber?: string;
  description?: string;
  ownerName: string;
  libraryCover: string | File;
  libraryThumbnailCover: string | File;
  popularityScore: number;
  roundedRating: number;
}

export interface LibraryRequest {
  name: string;
  address?: string;
  contactNumber?: string;
  description?: string;
  libraryCover?: string | File;
}

export interface LibraryInfo {
  library: Library;
}
