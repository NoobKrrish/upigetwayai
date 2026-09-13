import type { UPIPayConfig, CreatePaymentRequest } from '../types.js';

export function validateConfig(config: UPIPayConfig): void {
  if (!config) throw new Error('UPIPayConfig is required');
}

export function validatePaymentRequest(req: CreatePaymentRequest): void {
  if (!req.amount || req.amount <= 0) throw new Error('Amount must be greater than 0');
  if (!req.orderId) throw new Error('Order ID is required');
}

export function validateOrderId(orderId: string): void {
  if (!orderId) throw new Error('Order ID is required');
}

export function validateSaltIndex(index: string | number): void {
  if (!index) throw new Error('Salt index is required');
}

export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

export function validateQRRequest(req: any): void {
  if (!req.vpa || !req.name) {
    throw new Error('VPA and name are required for QR code generation');
  }
}


