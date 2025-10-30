// API service to connect to Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  message: string;
  role?: string;
}

export interface User {
  id?: number;
  username: string;
  fullName: string;
  role?: string;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  genre: string;
  isbn?: string;
  available?: boolean;
}

export interface Loan {
  id?: number;
  bookId: number;
  username: string;
  loanDate?: string;
  dueDate?: string;
  returnDate?: string;
  status?: string;
  approved?: boolean;
  bookTitle?: string;
  bookAuthor?: string;
  bookGenre?: string;
}

export interface ChangePasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}

export interface ProfileUpdateRequest {
  username: string;
  fullName: string;
}

// Library API class
class LibraryAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const username = localStorage.getItem('username');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(username && { 'X-User': username }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Une erreur est survenue');
    }

    // Handle empty responses (like for DELETE)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<User> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Login endpoint
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Change password endpoint (mapped to backend)
  async changePassword(data: ChangePasswordRequest): Promise<string> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get user info
  async getUserInfo(username: string): Promise<User> {
    return this.request(`/auth/user/${username}`);
  }

  // Update profile (mapped to backend)
  async updateProfile(data: ProfileUpdateRequest): Promise<string> {
    return this.request('/auth/user/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Create admin (for super admin operations)
  async createAdmin(data: RegisterRequest): Promise<User> {
    return this.request('/auth/admin/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Book endpoints
  async searchBooks(params: {
    title?: string;
    author?: string;
    genre?: string;
  }): Promise<Book[]> {
    const query = new URLSearchParams();
    if (params.title) query.append('title', params.title);
    if (params.author) query.append('author', params.author);
    if (params.genre) query.append('genre', params.genre);

    return this.request(`/books/search?${query.toString()}`);
  }

  // Get book by ID
  async getBookById(id: number): Promise<Book> {
    return this.request(`/books/${id}`);
  }

  // Admin book management
  async addBook(book: Book): Promise<Book> {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  // Update book details
  async updateBook(id: number, book: Book): Promise<Book> {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  }

  // Delete book by ID
  async deleteBook(id: number): Promise<string> {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Loan endpoints
  async requestLoan(username: string, bookId: number): Promise<Loan> {
    return this.request('/loans/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ username, bookId: bookId.toString() }),
    });
  }

  // Approve loan (librarian action)
  async approveLoan(loanId: number, approver: string): Promise<Loan> {
    return this.request('/loans/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ loanId: loanId.toString(), approver }),
    });
  }

  // Return book
  async returnBook(loanId: number, username: string): Promise<Loan> {
    return this.request('/loans/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ loanId: loanId.toString(), username }),
    });
  }

  // Get user's loans
  async getMyLoans(username: string): Promise<Loan[]> {
    return this.request(`/loans/my?username=${username}`);
  }

  // Pending loans endpoint (no longer needs username for filtering)
  async getPendingLoans(): Promise<Loan[]> {
    return this.request(`/loans/pending?username=dummy`);
  }

  // Get all loans (for admin)
  async getAllLoans(): Promise<Loan[]> {
    return this.request('/loans/all');
  }

  // Admin endpoints
  async createLibrarian(
    username: string,
    password: string,
    fullName: string
  ): Promise<User> {
    return this.request('/admin/create-librarian', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ username, password, fullName }),
    });
  }

  // Get all users
  async getAllUsers(): Promise<User[]> {
    return this.request('/admin/users');
  }

  // Promote user to new role
  async promoteUser(username: string, newRole: string): Promise<any> {
    return this.request('/admin/promote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ username, newRole }),
    });
  }

  // Delete user
  async deleteUser(username: string): Promise<string> {
    return this.request(`/admin/users/${username}`, {
      method: 'DELETE',
    });
  }
}

export const api = new LibraryAPI();