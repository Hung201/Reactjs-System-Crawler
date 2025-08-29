// Element Selector Script - Inject vào tab mới
(function () {
  let isSelectionMode = false;
  let highlightElement = null;
  let originalStyles = {};

  // Lắng nghe message từ tab gốc
  window.addEventListener('message', function (event) {
    if (event.data.type === 'START_ELEMENT_SELECTION') {
      startElementSelection();
    }
  });

  // Thêm script vào head nếu chưa có
  if (!document.getElementById('element-selector-script')) {
    const script = document.createElement('script');
    script.id = 'element-selector-script';
    script.textContent = `
      // Element Selector Functions
      window.elementSelector = {
        startSelection: function() {
          this.isSelectionMode = true;
          this.setupEventListeners();
          this.showInstructions();
        },
        
        isSelectionMode: false,
        highlightElement: null,
        originalStyles: {},
        
        setupEventListeners: function() {
          document.addEventListener('mouseover', this.handleMouseOver.bind(this));
          document.addEventListener('mouseout', this.handleMouseOut.bind(this));
          document.addEventListener('click', this.handleClick.bind(this));
          document.addEventListener('keydown', this.handleKeyDown.bind(this));
          document.body.style.cursor = 'crosshair';
        },
        
        handleMouseOver: function(event) {
          if (!this.isSelectionMode) return;
          
          const element = event.target;
          if (element === this.highlightElement) return;
          
          if (this.highlightElement) {
            this.removeHighlight(this.highlightElement);
          }
          
          this.highlightElement = element;
          this.addHighlight(element);
        },
        
        handleMouseOut: function(event) {
          if (!this.isSelectionMode) return;
          
          const element = event.target;
          if (element === this.highlightElement) {
            this.removeHighlight(element);
            this.highlightElement = null;
          }
        },
        
        handleClick: function(event) {
          if (!this.isSelectionMode) return;
          
          event.preventDefault();
          event.stopPropagation();
          
          const element = event.target;
          const classPath = this.getClassPath(element);
          
          window.opener.postMessage({
            type: 'ELEMENT_SELECTED',
            classPath: classPath,
            elementInfo: {
              tagName: element.tagName.toLowerCase(),
              className: element.className,
              id: element.id,
              textContent: element.textContent?.substring(0, 100) + '...'
            }
          }, '*');
          
          this.cleanup();
        },
        
        handleKeyDown: function(event) {
          if (!this.isSelectionMode && event.key === 'Escape') {
            this.cleanup();
          }
        },
        
        addHighlight: function(element) {
          this.originalStyles[element] = {
            outline: element.style.outline,
            backgroundColor: element.style.backgroundColor,
            position: element.style.position,
            zIndex: element.style.zIndex
          };
          
          element.style.outline = '2px solid #2563eb';
          element.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
          element.style.position = 'relative';
          element.style.zIndex = '1000001';
        },
        
        removeHighlight: function(element) {
          if (this.originalStyles[element]) {
            element.style.outline = this.originalStyles[element].outline;
            element.style.backgroundColor = this.originalStyles[element].backgroundColor;
            element.style.position = this.originalStyles[element].position;
            element.style.zIndex = this.originalStyles[element].zIndex;
            delete this.originalStyles[element];
          }
        },
        
        getClassPath: function(element, maxDepth = 3) {
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
        },
        
        showInstructions: function() {
          const overlay = document.createElement('div');
          overlay.id = 'element-selector-overlay';
          overlay.style.cssText = \`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            z-index: 999999;
            pointer-events: none;
          \`;
          
          const instruction = document.createElement('div');
          instruction.style.cssText = \`
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
          \`;
          instruction.textContent = 'Click vào element bạn muốn chọn. Nhấn ESC để hủy.';
          
          document.body.appendChild(overlay);
          document.body.appendChild(instruction);
        },
        
        cleanup: function() {
          this.isSelectionMode = false;
          
          const overlay = document.getElementById('element-selector-overlay');
          if (overlay) overlay.remove();
          
          const instructions = document.querySelectorAll('[style*="z-index: 1000000"]');
          instructions.forEach(el => el.remove());
          
          if (this.highlightElement) {
            this.removeHighlight(this.highlightElement);
            this.highlightElement = null;
          }
          
          document.removeEventListener('mouseover', this.handleMouseOver.bind(this));
          document.removeEventListener('mouseout', this.handleMouseOut.bind(this));
          document.removeEventListener('click', this.handleClick.bind(this));
          document.removeEventListener('keydown', this.handleKeyDown.bind(this));
          
          document.body.style.cursor = '';
        }
      };
    `;
    document.head.appendChild(script);
  }

  function startElementSelection() {
    // Sử dụng window.elementSelector nếu có
    if (window.elementSelector) {
      window.elementSelector.startSelection();
    } else {
      // Fallback cho trường hợp script chưa load xong
      setTimeout(() => {
        if (window.elementSelector) {
          window.elementSelector.startSelection();
        }
      }, 100);
    }
  }
})();
