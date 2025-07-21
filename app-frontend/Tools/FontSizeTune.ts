export default class FontSizeTune {
  static get isTune() {
    return true;
  }

  private data: { fontSize: string };
  private api: any;

  constructor({ data, api }: any) {
    this.api = api;
    this.data = data || {
      fontSize: '16px',
    };
  }

  render() {
    const wrapper = document.createElement('div');
    const select = document.createElement('select');
    select.style.margin = '0 8px';

    const sizes = ['12px', '14px', '16px', '18px', '20px', '24px'];

    sizes.forEach((size) => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      if (size === this.data.fontSize) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      this.data.fontSize = select.value;
    });

    wrapper.appendChild(select);
    return wrapper;
  }

  save() {
    return this.data;
  }

  wrap(blockContent: HTMLElement) {
    if (this.data.fontSize) {
      blockContent.style.fontSize = this.data.fontSize;
    }
    return blockContent;
  }
}
