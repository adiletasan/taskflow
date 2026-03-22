import api from './axios';

export const billingApi = {
  createCheckout: () =>
    api.post<{ url: string }>('/billing/checkout'),

  createPortal: () =>
    api.post<{ url: string }>('/billing/portal'),
};