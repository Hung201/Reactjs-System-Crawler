// Bookmarklet để chọn element
javascript: (function () {
    // Kiểm tra xem đã có script chưa
    if (window.elementSelectorActive) {
        alert('Element selector đã được kích hoạt!');
        return;
    }

    window.elementSelectorActive = true;

    let highlightElement = null;
    let originalStyles = {};

    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.id = 'element-selector-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 999999;
    pointer-events: none;
  `;

    // Tạo hướng dẫn
    const instruction = document.createElement('div');
    instruction.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2563eb;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 1000000;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;
    instruction.textContent = 'Click vào element bạn muốn chọn. Nhấn ESC để hủy.';

    // Thêm vào DOM
    document.body.appendChild(overlay);
    document.body.appendChild(instruction);

    // Thay đổi cursor
    document.body.style.cursor = 'crosshair';

    // Hàm highlight element
    function addHighlight(element) {
        originalStyles[element] = {
            outline: element.style.outline,
            backgroundColor: element.style.backgroundColor,
            position: element.style.position,
            zIndex: element.style.zIndex
        };

        element.style.outline = '2px solid #2563eb';
        element.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        element.style.position = 'relative';
        element.style.zIndex = '1000001';
    }

    // Hàm xóa highlight
    function removeHighlight(element) {
        if (originalStyles[element]) {
            element.style.outline = originalStyles[element].outline;
            element.style.backgroundColor = originalStyles[element].backgroundColor;
            element.style.position = originalStyles[element].position;
            element.style.zIndex = originalStyles[element].zIndex;
            delete originalStyles[element];
        }
    }

    // Hàm lấy class path
    function getClassPath(element, maxDepth = 3) {
        const path = [];
        let currentElement = element;
        let depth = 0;

        while (currentElement && currentElement !== document.body && depth < maxDepth) {
            let selector = currentElement.tagName.toLowerCase();

            if (currentElement.id) {
                selector += '#' + currentElement.id;
            } else if (currentElement.className && typeof currentElement.className === 'string') {
                const classes = currentElement.className.split(' ').filter(c => c.trim());
                if (classes.length > 0) {
                    selector += '.' + classes.join('.');
                }
            }

            path.unshift(selector);
            currentElement = currentElement.parentElement;
            depth++;
        }

        return path.join(' > ');
    }

    // Hàm cleanup
    function cleanup() {
        window.elementSelectorActive = false;

        // Xóa overlay và instruction
        const overlay = document.getElementById('element-selector-overlay');
        if (overlay) overlay.remove();

        const instructions = document.querySelectorAll('[style*="z-index: 1000000"]');
        instructions.forEach(el => el.remove());

        // Xóa highlight
        if (highlightElement) {
            removeHighlight(highlightElement);
            highlightElement = null;
        }

        // Xóa event listeners
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeyDown);

        // Khôi phục cursor
        document.body.style.cursor = '';
    }

    // Event handlers
    function handleMouseOver(event) {
        const element = event.target;
        if (element === highlightElement) return;

        if (highlightElement) {
            removeHighlight(highlightElement);
        }

        highlightElement = element;
        addHighlight(element);
    }

    function handleMouseOut(event) {
        const element = event.target;
        if (element === highlightElement) {
            removeHighlight(element);
            highlightElement = null;
        }
    }

    function handleClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const element = event.target;
        const classPath = getClassPath(element);

        // Hiển thị kết quả
        const result = prompt('Class path đã chọn:', classPath);

        // Copy vào clipboard nếu có thể
        if (result && navigator.clipboard) {
            navigator.clipboard.writeText(result).then(() => {
                alert('Đã copy class path vào clipboard!');
            }).catch(() => {
                alert('Không thể copy vào clipboard, nhưng đã hiển thị trong prompt.');
            });
        }

        cleanup();
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            cleanup();
        }
    }

    // Thêm event listeners
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
})();
