import { setupCounter } from './counter';

describe('setupCounter', () => {
  let buttonElement: HTMLButtonElement;

  beforeEach(() => {
    buttonElement = document.createElement('button') as HTMLButtonElement;
  });

  test('should initialize counter to 0', () => {
    setupCounter(buttonElement);

    expect(buttonElement.innerHTML).toBe('count is 0');
  });

  test('should increment counter by 1 when element is clicked', () => {
    setupCounter(buttonElement);

    buttonElement.click();

    expect(buttonElement.innerHTML).toBe('count is 1');
  });

  test('should increment counter multiple times when clicked multiple times', () => {
    setupCounter(buttonElement);

    buttonElement.click();
    buttonElement.click();
    buttonElement.click();

    expect(buttonElement.innerHTML).toBe('count is 3');
  });
});
