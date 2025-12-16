/**
 * Service Selector Component
 */
class ServiceSelector extends BaseComponent {
    /**
     * @param {string} currentService
     * @param {Function} onChange
     */
    constructor(currentService, onChange) {
        super();
        this.currentService = currentService;
        this.onChange = onChange;
    }

    render() {
        this.element = DOMUtils.createElement('div', 'inline-service-selector');

        const select = DOMUtils.createElement('select', 'inline-service-select');
        select.id = 'inlineServiceSelect';

        const services = getAllServices();
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            if (service.id === this.currentService) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        this.addEventListener(select, 'change', (e) => {
            const newValue = e.target.value;
            this.currentService = newValue;
            if (this.onChange) {
                this.onChange(newValue);
            }
        });

        this.element.appendChild(select);
        return this.element;
    }

    /**
     * Get current value
     */
    getValue() {
        return this.currentService;
    }

    /**
     * Set current value
     * @param {string} value
     */
    setValue(value) {
        this.currentService = value;
        if (this.element) {
            const select = this.element.querySelector('select');
            if (select) select.value = value;
        }
    }
}
