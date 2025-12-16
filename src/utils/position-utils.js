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
    static calculatePopupPosition(iconRect, popupWidth = 400) {
        const margin = 10;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // 1. Calculate Left
        let left = iconRect.left + scrollX;

        // Prevent overflowing right edge
        if (left + popupWidth > scrollX + viewportWidth - margin) {
            left = scrollX + viewportWidth - popupWidth - margin;
        }

        // Prevent overflowing left edge
        if (left < scrollX + margin) {
            left = scrollX + margin;
        }

        // 2. Vertical Calculation
        const spaceBelow = viewportHeight - iconRect.bottom - margin;
        const spaceAbove = iconRect.top - margin;

        // Decide placement
        // Default to below if there's enough space (e.g. > 250px) or if it's larger than space above
        const minHeightBelow = 250;

        let top, maxHeight, transform;

        if (spaceBelow >= minHeightBelow || spaceBelow >= spaceAbove) {
            // Place BELOW
            top = iconRect.bottom + scrollY + 8;
            maxHeight = spaceBelow;
            transform = 'none';
        } else {
            // Place ABOVE
            // Position at top of icon minus gap, and translate up by 100%
            top = iconRect.top + scrollY - 8;
            maxHeight = spaceAbove;
            transform = 'translateY(-100%)';
        }

        // Ensure absolute minimum max-height to avoid tiny popups
        maxHeight = Math.max(maxHeight, 150);

        return { left, top, maxHeight, transform };
    }
}
