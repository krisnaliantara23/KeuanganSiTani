// src/utils/storage.ts

export interface User {
  username: string;
  password: string;
}

export interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string; // format: YYYY-MM-DD
}

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

// Ambil semua user
export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

// Simpan semua user
export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Tambah user baru
export function addUser(user: User) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

// Ambil user yang sedang login
export function getCurrentUser(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

// Set user yang sedang login
export function setCurrentUser(username: string) {
  localStorage.setItem(CURRENT_USER_KEY, username);
}

// Hapus status login
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ==== Transaksi ====

// Ambil transaksi user tertentu
export function getTransactions(username: string): Transaction[] {
  const key = `transactions_${username}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Simpan transaksi user tertentu
export function saveTransactions(username: string, transactions: Transaction[]) {
  const key = `transactions_${username}`;
  localStorage.setItem(key, JSON.stringify(transactions));
}

// Tambah transaksi
export function addTransaction(username: string, transaction: Transaction) {
  const transactions = getTransactions(username);
  transactions.push(transaction);
  saveTransactions(username, transactions);
}
