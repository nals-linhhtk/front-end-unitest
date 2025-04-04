import { Order } from '../models/order.model';
import { PaymentService } from './payment.service';

export class OrderService {
  private readonly couponApiUrl = 'https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons';
  private readonly orderApiUrl = 'https://67eb7353aa794fb3222a4c0e.mockapi.io/order';

  constructor(private readonly paymentService: PaymentService) { }

  async process(order: Partial<Order>) {
    this.validateOrder(order);

    let totalPrice = this.calculateInitialTotal(order);

    if (order.couponId) {
      totalPrice = await this.applyCoupon(totalPrice, order.couponId);
    }

    const orderPayload = this.buildOrderPayload(order, totalPrice);
    const createdOrder = await this.submitOrder(orderPayload);

    this.paymentService.payViaLink(createdOrder);
  }

  private validateOrder(order: Partial<Order>): void {
    if (!order.items?.length) {
      throw new Error('Order items are required');
    }

    if (order.items.some(item => item.price <= 0 || item.quantity <= 0)) {
      throw new Error('Order items are invalid');
    }
  }

  private calculateInitialTotal(order: Partial<Order>): number {
    const totalPrice = order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

    if (totalPrice <= 0) {
      throw new Error('Total price must be greater than 0');
    }

    return totalPrice;
  }

  private async applyCoupon(totalPrice: number, couponId: string): Promise<number> {
    const coupon = await this.fetchCoupon(couponId);

    if (!coupon) {
      throw new Error('Invalid coupon');
    }

    let discountedPrice = totalPrice - coupon.discount;
    return discountedPrice < 0 ? 0 : discountedPrice;
  }

  private async fetchCoupon(couponId: string) {
    const response = await fetch(`${this.couponApiUrl}/${couponId}`);
    return await response.json();
  }

  private buildOrderPayload(order: Partial<Order>, totalPrice: number) {
    return {
      ...order,
      totalPrice,
      paymentMethod: this.paymentService.buildPaymentMethod(totalPrice),
    };
  }

  private async submitOrder(orderPayload: any) {
    const orderResponse = await fetch(this.orderApiUrl, {
      method: 'POST',
      body: JSON.stringify(orderPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    return await orderResponse.json();
  }
}
