import { setupCounter } from './counter';

describe('App Initialization', () => {
  let appContainer: HTMLElement | null;
  let counterButton: HTMLButtonElement | null;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src="/vite.svg" class="logo" alt="Vite logo" />
          </a>
          <a href="https://www.typescriptlang.org/" target="_blank">
            <img src="./typescript.svg" class="logo vanilla" alt="TypeScript logo" />
          </a>
          <h1>Vite + TypeScript</h1>
          <div class="card">
            <button id="counter" type="button"></button>
          </div>
          <p class="read-the-docs">
            Click on the Vite and TypeScript logos to learn more
          </p>
        </div>
      </div>
    `;

    appContainer = document.querySelector('#app');
    counterButton = document.querySelector('#counter');
  });

  it('should render the app container', () => {
    expect(appContainer).not.toBeNull();
  });

  it('should have a counter button', () => {
    expect(counterButton).not.toBeNull();
  });

  it('should initialize the counter when setupCounter is called', () => {
    if (counterButton) {
      setupCounter(counterButton);
      expect(counterButton.textContent).toBe('count is 0');
    }
  });

  it('should increment the counter on button click', () => {
    if (counterButton) {
      setupCounter(counterButton);
      counterButton.click();
      expect(counterButton.textContent).toBe('count is 1');
    }
  });
});