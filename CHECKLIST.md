# Unit Test Checklist

## PaymentService

### buildPaymentMethod(totalPrice: number)
- [x] Should include all payment methods when totalPrice is small
- [x] Should exclude PAYPAY when totalPrice > 500,000
- [x] Should exclude AUPAY when totalPrice > 300,000
- [x] Should use custom payment methods if provided

### getPaymentUrl(orderId: string)
- [x] Should return correct URL with orderId

### payViaLink(order: Order)
- [x] Should open payment URL in a new window

## WindowService

### BrowserWindowService
- [x] Should call window.open with the provided URL and target
- [x] Should work with different target values
- [x] Should handle URLs with query parameters correctly
- [x] Should handle URLs with special characters

## OrderService

### validateOrder()
- [x] Should throw error if order items are empty
- [x] Should throw error if any item has invalid price or quantity
- [x] Should not throw error for valid order

### calculateInitialTotal()
- [x] Should calculate total price correctly
- [x] Should throw error if total price is zero or negative

### applyCoupon()
- [x] Should apply coupon discount correctly
- [x] Should return 0 if discount is greater than total price
- [x] Should throw error for invalid coupon

### process()

- [x] Should process order successfully
- [x] Should apply coupon if provided

## Main

### App Initialization
- [x] Should render the app container
- [x] Should have a counter button
- [x] Should initialize the counter when setupCounter is called
- [x] Should increment the counter on button click
