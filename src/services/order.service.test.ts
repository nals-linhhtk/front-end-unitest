import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { Order, OrderItem } from '../models/order.model';
import { PaymentMethod } from '../models/payment.model';

describe('OrderService', () => {
  let orderService: OrderService;
  let mockPaymentService: PaymentService;

  beforeEach(() => {
    mockPaymentService = {
      buildPaymentMethod: vi.fn().mockReturnValue(PaymentMethod.CREDIT),
      getPaymentUrl: vi.fn().mockReturnValue('https://payment.example.com/pay?orderId=123'),
      payViaLink: vi.fn(),
    } as any;

    orderService = new OrderService(mockPaymentService);

    global.fetch = vi.fn();
  });

  describe('validateOrder', () => {
    it('should throw error if order items are empty', () => {
      const order: Partial<Order> = {
        id: '123',
        paymentMethod: PaymentMethod.CREDIT,
        items: []
      };

      expect(() => orderService['validateOrder'](order)).toThrow('Order items are required');
    });

    it('should throw error if any item has invalid price or quantity', () => {
      const order: Partial<Order> = {
        id: '123',
        paymentMethod: PaymentMethod.CREDIT,
        items: [
          { id: '1', productId: 'p1', price: 0, quantity: 1 } as OrderItem
        ]
      };

      expect(() => orderService['validateOrder'](order)).toThrow('Order items are invalid');
    });

    it('should not throw error for valid order', async () => {
      const order: Partial<Order> = {
        id: '123',
        paymentMethod: PaymentMethod.CREDIT,
        items: [
          { id: '1', productId: 'p1', price: 100, quantity: 2 } as OrderItem
        ]
      };

      expect(() => orderService['validateOrder'](order)).not.toThrow();
    });
  });

  describe('calculateInitialTotal', () => {
    it('should calculate total price correctly', () => {
      const order: Partial<Order> = {
        items: [
          { id: '1', productId: 'p1', price: 100, quantity: 2 } as OrderItem,
          { id: '2', productId: 'p2', price: 150, quantity: 1 } as OrderItem
        ]
      };

      const total = orderService['calculateInitialTotal'](order);
      expect(total).toBe(350); // 100*2 + 150*1 = 350
    });

    it('should throw error if total price is zero or negative', () => {
      const order: Partial<Order> = {
        items: [
          { id: '1', productId: 'p1', price: -100, quantity: 2 } as OrderItem,
          { id: '2', productId: 'p2', price: 50, quantity: 1 } as OrderItem
        ]
      };

      expect(() => orderService['calculateInitialTotal'](order)).toThrow('Total price must be greater than 0');
    });
  });

  describe('applyCoupon', () => {
    it('should apply coupon discount correctly', async () => {
      const coupon = { id: 'coupon1', discount: 50 };
      (global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(coupon)
      });

      const discountedPrice = await orderService['applyCoupon'](200, 'coupon1');
      expect(discountedPrice).toBe(150);
    });

    it('should return 0 if discount is greater than total price', async () => {
      const coupon = { id: 'coupon1', discount: 300 };
      (global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(coupon)
      });

      const discountedPrice = await orderService['applyCoupon'](200, 'coupon1');
      expect(discountedPrice).toBe(0);
    });

    it('should throw error for invalid coupon', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(null)
      });

      await expect(orderService['applyCoupon'](200, 'invalid')).rejects.toThrow('Invalid coupon');
    });
  });

  describe('process', () => {
    it('should process order successfully', async () => {
      const order: Partial<Order> = {
        id: '123',
        items: [
          { id: '1', productId: 'p1', price: 100, quantity: 2 } as OrderItem
        ],
        paymentMethod: PaymentMethod.CREDIT
      };

      const createdOrder = { ...order, totalPrice: 200 } as Order;

      vi.spyOn<any, any>(orderService, 'validateOrder').mockImplementation(() => { });
      vi.spyOn<any, any>(orderService, 'calculateInitialTotal').mockReturnValue(200);
      vi.spyOn<any, any>(orderService, 'buildOrderPayload').mockReturnValue({ ...order, totalPrice: 200 });
      vi.spyOn<any, any>(orderService, 'submitOrder').mockResolvedValue(createdOrder);

      await orderService.process(order);

      expect(orderService['validateOrder']).toHaveBeenCalledWith(order);
      expect(orderService['calculateInitialTotal']).toHaveBeenCalledWith(order);
      expect(mockPaymentService.payViaLink).toHaveBeenCalledWith(createdOrder);
    });

    it('should apply coupon if provided', async () => {
      const order: Partial<Order> = {
        id: '123',
        items: [
          { id: '1', productId: 'p1', price: 100, quantity: 2 } as OrderItem
        ],
        couponId: 'coupon1',
        paymentMethod: PaymentMethod.CREDIT
      };

      const createdOrder = { ...order, totalPrice: 150 } as Order;

      vi.spyOn<any, any>(orderService, 'validateOrder').mockImplementation(() => { });
      vi.spyOn<any, any>(orderService, 'calculateInitialTotal').mockReturnValue(200);
      vi.spyOn<any, any>(orderService, 'applyCoupon').mockResolvedValue(150);
      vi.spyOn<any, any>(orderService, 'buildOrderPayload').mockReturnValue({ ...order, totalPrice: 150 });
      vi.spyOn<any, any>(orderService, 'submitOrder').mockResolvedValue(createdOrder);

      await orderService.process(order);

      expect(orderService['applyCoupon']).toHaveBeenCalledWith(200, 'coupon1');
      expect(mockPaymentService.payViaLink).toHaveBeenCalledWith(createdOrder);
    });
  });
});
