import React from 'react';

const BookmarkletCode = () => {
    const bookmarkletCode = `javascript:(function(){
    try {
        let active = false;
        let highlight = null;
        
        function start(){
            if(active) return;
            active = true;
            document.body.style.cursor = 'crosshair';
            document.addEventListener('mouseover', over, true);
            document.addEventListener('click', click, true);
            document.addEventListener('keydown', key, true);
            console.log('Element selector activated!');
            alert('Element selector đã kích hoạt! Click vào element để lấy selector.');
        }
        
        function over(e){
            if(!active) return;
            if(highlight) highlight.style.outline = '';
            highlight = e.target;
            highlight.style.outline = '3px solid red';
        }
        
        function click(e){
            if(!active) return;
            e.preventDefault();
            e.stopPropagation();
            
            let element = e.target;
            let selector2Levels = getSelectorWithLevels(element, 2);
            let selector3Levels = getSelectorWithLevels(element, 3);
            let simpleSelector = getSimpleSelector(element);
            
            let result = selector3Levels;
            
            prompt('Element Selectors (Copy selector phù hợp):', result);
            cleanup();
        }
        
        function getSelectorWithLevels(element, maxLevels){
            let path = [];
            let current = element;
            let level = 0;
            
            while(current && current !== document.body && level < maxLevels){
                let selector = current.tagName.toLowerCase();
                
                if(current.id){
                    selector = '#' + current.id;
                }
                else if(current.className){
                    let classes = current.className.split(' ').filter(c => c.trim());
                    if(classes.length > 0){
                        let mainClass = classes[0];
                        if(!mainClass.includes('lazy') && !mainClass.includes('active') && !mainClass.includes('skip')){
                            selector = '.' + mainClass;
                        }
                    }
                }
                
                path.unshift(selector);
                current = current.parentElement;
                level++;
            }
            
            return path.join(' > ');
        }
        
        function getSimpleSelector(element){
            let selector = element.tagName.toLowerCase();
            
            if(element.id) return '#' + element.id;
            
            if(element.className){
                let classes = element.className.split(' ').filter(c => c.trim());
                if(classes.length > 0){
                    return '.' + classes[0];
                }
            }
            
            return selector;
        }
        
        function key(e){
            if(e.key === 'Escape') cleanup();
        }
        
        function cleanup(){
            active = false;
            if(highlight) highlight.style.outline = '';
            document.body.style.cursor = '';
            document.removeEventListener('mouseover', over, true);
            document.removeEventListener('click', click, true);
            document.removeEventListener('keydown', key, true);
        }
        
        start();
    } catch(error) {
        alert('Lỗi: ' + error.message);
        console.error('Bookmarklet error:', error);
    }
})();`;

    return (
        <div className="text-xs bg-white px-2 py-1 rounded break-all border">
            <p className="font-medium mb-1">Bookmarklet code:</p>
            <textarea
                className="w-full text-xs bg-gray-50 p-2 rounded border"
                rows={3}
                readOnly
                value={bookmarkletCode}
            />
            <p className="text-xs text-gray-600 mt-1">
                Kéo code này vào thanh bookmark của trình duyệt
            </p>
        </div>
    );
};

export default BookmarkletCode;
