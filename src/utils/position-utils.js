/**
 * Position calculation utilities for popup positioning
 */
class PositionUtils {
    /**
     * Calculate popup position near icon
     * @param {DOMRect} iconRect
     * @param {number} popupWidth
     * @param {number} popupHeight
     * @returns {{left: number, top: number}}
     */
    /**
     * Calculate popup position suitable for fixed positioning
     * @param {DOMRect} targetRect - The bounding rect of the selection or target element
     * @param {DOMRect} popupRect - The bounding rect of the rendered popup
     * @returns {{left: number, top: number}}
     */
    static calculatePopupPosition(targetRect, popupRect) {
        // Use clientWidth to exclude scrollbar width, preventing overlap
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight;

        const popupWidth = popupRect.width;
        const popupHeight = popupRect.height;
        const margin = 10; // Increased margin slightly to 10 for safety

        // Initial position (below selection)
        let top = targetRect.bottom + margin;
        let left = targetRect.left;

        // 1. Horizontal Constraint (Right)
        if (left + popupWidth > viewportWidth - margin) {
            left = viewportWidth - popupWidth - margin;
        }

        // 2. Horizontal Constraint (Left)
        if (left < margin) {
            left = margin;
        }

        // 3. Vertical Constraint (Bottom) -> flip to top
        if (top + popupHeight > viewportHeight - margin) {
            // Check if there is space above
            // If flipping above puts it offscreen top, we might need other logic, 
            // but standard 'flip' is requested.
            top = targetRect.top - popupHeight - margin;
        }

        // 4. Vertical Constraint (Top)
        if (top < margin) {
            top = margin;
        }

        return { left, top };
    }
}
