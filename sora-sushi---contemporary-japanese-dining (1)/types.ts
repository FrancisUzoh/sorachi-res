export interface MenuItem {
  id: string;
  item_name: string;
  description: string;
  price: number;
  category: string;
}

export interface Booking {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string;
  booking_date: string;
  guests: number;
  deposit_paid: boolean;
  deposit_amount: number;
  status: 'pending' | 'confirmed' | 'canceled';
  selected_menu: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}
