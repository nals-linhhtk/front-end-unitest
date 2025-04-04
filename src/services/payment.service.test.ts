import { PaymentService, WindowService, BrowserWindowService } from './payment.service';
import { PaymentMethod } from '../models/payment.model';
import { Order } from '../models/order.model';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockWindowService: WindowService;

  beforeEach(() => {
    mockWindowService = {
      openUrl: vi.fn()
    };
  });

  describe('buildPaymentMethod', () => {
    it('should include all payment methods when totalPrice is small', () => {
      paymentService = new PaymentService(undefined, mockWindowService);
      const result = paymentService.buildPaymentMethod(100000);
      expect(result).toBe('credit,paypay,aupay');
    });

    it('should exclude PAYPAY when totalPrice > 500,000', () => {
      paymentService = new PaymentService(undefined, mockWindowService);
      const result = paymentService.buildPaymentMethod(600000);
      expect(result).toBe('credit');
    });

    it('should exclude AUPAY when totalPrice > 300,000', () => {
      paymentService = new PaymentService(undefined, mockWindowService);
      const result = paymentService.buildPaymentMethod(400000);
      expect(result).toBe('credit,paypay');
    });

    it('should use custom payment methods if provided', () => {
      paymentService = new PaymentService([PaymentMethod.CREDIT], mockWindowService);
      const result = paymentService.buildPaymentMethod(100000);
      expect(result).toBe('credit');
    });
  });

  describe('getPaymentUrl', () => {
    it('should return correct URL with orderId', () => {
      paymentService = new PaymentService(undefined, mockWindowService);
      const orderId = '12345';
      const result = paymentService.getPaymentUrl(orderId);
      expect(result).toBe(`https://payment.example.com/pay?orderId=${orderId}`);
    });
  });

  describe('payViaLink', () => {
    it('should open payment URL in a new window', async () => {
      paymentService = new PaymentService(undefined, mockWindowService);

      const mockOrder: Order = {
        id: '12345',
        totalPrice: 100000,
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            price: 100000,
            quantity: 1
          }
        ],
        paymentMethod: PaymentMethod.CREDIT
      };

      await paymentService.payViaLink(mockOrder);

      expect(mockWindowService.openUrl).toHaveBeenCalledWith(
        'https://payment.example.com/pay?orderId=12345',
        '_blank'
      );
    });
  });
});

describe('WindowService', () => {
  describe('BrowserWindowService', () => {
    let browserWindowService: BrowserWindowService;

    beforeEach(() => {
      window.open = vi.fn();
      browserWindowService = new BrowserWindowService();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should call window.open with the provided URL and target', () => {
      const testUrl = 'https://test.example.com';
      const testTarget = '_blank';

      browserWindowService.openUrl(testUrl, testTarget);

      expect(window.open).toHaveBeenCalledTimes(1);
      expect(window.open).toHaveBeenCalledWith(testUrl, testTarget);
    });

    it('should work with different target values', () => {
      const testUrl = 'https://test.example.com';

      browserWindowService.openUrl(testUrl, '_self');
      expect(window.open).toHaveBeenCalledWith(testUrl, '_self');

      browserWindowService.openUrl(testUrl, '_top');
      expect(window.open).toHaveBeenCalledWith(testUrl, '_top');

      browserWindowService.openUrl(testUrl, 'customName');
      expect(window.open).toHaveBeenCalledWith(testUrl, 'customName');
    });

    it('should handle URLs with query parameters correctly', () => {
      const testUrl = 'https://test.example.com/checkout?orderId=123&token=abc123';
      const testTarget = '_blank';

      browserWindowService.openUrl(testUrl, testTarget);

      expect(window.open).toHaveBeenCalledWith(testUrl, testTarget);
    });

    it('should handle URLs with special characters', () => {
      const testUrl = 'https://test.example.com/search?q=test%20query&lang=en';
      const testTarget = '_blank';

      browserWindowService.openUrl(testUrl, testTarget);

      expect(window.open).toHaveBeenCalledWith(testUrl, testTarget);
    });
  });
});
