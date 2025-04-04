import { PaymentMethod } from "../models/payment.model";
import { Order } from '../models/order.model';

export interface WindowService {
  openUrl(url: string, target: string): void;
}

export class BrowserWindowService implements WindowService {
  openUrl(url: string, target: string): void {
    window.open(url, target);
  }
}

export class PaymentService {
  private readonly paymentMethods: PaymentMethod[];
  private windowService: WindowService;

  constructor(
    paymentMethods?: PaymentMethod[],
    windowService?: WindowService
  ) {
    this.paymentMethods = paymentMethods || [
      PaymentMethod.CREDIT,
      PaymentMethod.PAYPAY,
      PaymentMethod.AUPAY,
    ];
    this.windowService = windowService || new BrowserWindowService();
  }

  buildPaymentMethod(totalPrice: number): string {
    const filteredMethods = this.paymentMethods.filter(method => {
      if (method === PaymentMethod.PAYPAY) {
        // if totalPrice > 500,000 remove PAYPAY
        return totalPrice <= 500000;
      }

      if (method === PaymentMethod.AUPAY) {
        // if totalPrice > 300,000 remove AUPAY
        return totalPrice <= 300000;
      }

      return !!method;
    });

    return filteredMethods.join(',');
  }

  getPaymentUrl(orderId: string): string {
    return `https://payment.example.com/pay?orderId=${orderId}`;
  }

  async payViaLink(order: Order): Promise<void> {
    const url = this.getPaymentUrl(order.id);
    this.windowService.openUrl(url, '_blank');
  }
}
