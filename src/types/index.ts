export type ConversationStatus = "active" | "escalated" | "closed";

export type MessageRole = "user" | "assistant";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface RestaurantHours {
  [day: string]: { open: string; close: string } | null;
}

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface RestaurantConfigData {
  name: string;
  address: string;
  phone: string;
  hours: RestaurantHours;
  menu: MenuItem[];
  faqs: FAQ[];
}

export interface TwilioWebhookBody {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
}

export interface ReservationData {
  guestName: string | null;
  date: string | null;
  time: string | null;
  partySize: number | null;
}