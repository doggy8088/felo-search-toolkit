(async function () {
    'use strict';

    let is_felo_page_enabled = false;

    if (window.location.hostname === 'felo.ai') {
        initialize_for_felo();

        setInterval(check_for_felo_page_preview, 600);
    }

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === 'getMarkdown') {
            (async () => {
                try {
                    let html;

                    // 取得選取範圍的 HTML
                    const sel = document.getSelection();
                    if (!sel || sel.isCollapsed) {
                        // 沒有選取範圍，回傳空字串
                        sendResponse({ markdown: '' });
                        return;
                    }

                    // 有選取範圍，取得 HTML
                    const range = sel.getRangeAt(0);
                    const div = document.createElement('div');
                    const clone = range.cloneContents();

                    // 把所有相對連結都根據目前網址改成絕對連結
                    const baseUrl = window.location.origin;
                    const links = clone.querySelectorAll('a[href]');
                    links.forEach(link => {
                        if (!link.innerText.trim()) {
                            link.remove();
                            return;
                        }
                        const href = link.getAttribute('href');
                        if (href && !href.startsWith('http')) {
                            link.setAttribute('href', new URL(href, baseUrl).href);
                        }
                    });

                    // 圖片連結也要改
                    const images = clone.querySelectorAll('img[src]');
                    images.forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && !src.startsWith('http')) {
                            img.setAttribute('src', new URL(src, baseUrl).href);
                        }
                    });

                    div.appendChild(clone);
                    div.querySelectorAll(
                        'head, script, iframe, style, link, noscript, template, object, embed, meta, base, param, source, track, input[type="hidden"]'
                    ).forEach(el => el.remove());

                    html = div.innerHTML;

                    // 轉 Markdown
                    const turndownService = new TurndownService({
                        headingStyle: 'atx',
                        hr: '- - -',
                        bulletListMarker: '-',
                        codeBlockStyle: 'fenced',
                        fence: '```',
                        emDelimiter: '_',
                        strongDelimiter: '**',
                        linkStyle: 'inlined',
                        linkReferenceStyle: 'full',
                        br: '  ',
                        preformattedCode: false
                    });

                    const markdown = turndownService.turndown(html);

                    sendResponse({ markdown });
                } catch (error) {
                    console.error('getMarkdown error:', error);
                    sendResponse({ markdown: '' });
                }
            })();
            return true;
        }
    });

    function initialize_for_felo() {
        let prompt = ''

        try {
            prompt = atou(location.hash.substring(1));
            if (history.replaceState) {
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
            } else {
                window.location.hash = '';
            }
        } catch { }

        if (!!prompt) {
            setTimeout(() => {
                const defaultInput = document.querySelector('main')?.querySelectorAll('textarea');
                if (defaultInput?.length === 1) {
                    const textarea = defaultInput[0];
                    textarea.dispatchEvent(new Event('focus', { bubbles: true }));

                    // 這行是關鍵，不這樣就無法變更 textarea 的值
                    Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set.call(textarea, prompt);

                    // 這行也是關鍵，必須要送出 input 事件才能讓 textarea 的值寫回 React 元件的狀態
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));

                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length); //將選擇範圍設定為文本的末尾
                    textarea.scrollTop = textarea.scrollHeight; // 自動捲動到最下方

                    const button = document.querySelector("button[type=submit]");
                    setTimeout(() => { button.click(); }, 200);
                }
            }, 0);
        }

        function atou(str) {
            // 將 Base64 字串解碼回原始 UTF-8
            return decodeURIComponent(escape(atob(str)));
        }

        function isCtrlOrMetaKeyPressed(event) {
            return event.ctrlKey || event.metaKey;
        }

        document.addEventListener('keydown', async (event) => {

            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 'j') {
                const matchingLink = document.querySelector(`a[href='${window.location.pathname}']`);
                if (matchingLink) {
                    const nextLink = matchingLink?.closest('li')?.nextElementSibling?.querySelector('a')
                        ?? matchingLink?.closest('li')?.nextElementSibling?.nextElementSibling?.querySelector('a');
                    if (nextLink) {
                        nextLink?.parentElement?.previousElementSibling?.scrollIntoView();
                        nextLink?.click();
                    }
                } else {
                    const firstLink = document.querySelector(`a[href*='/search/']`);
                    firstLink?.click();
                }
                event.preventDefault();
            }

            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 'k') {
                const matchingLink = document.querySelector(`a[href='${window.location.pathname}']`);
                const previousLink = matchingLink?.closest('li')?.previousElementSibling?.querySelector('a')
                    ?? matchingLink?.closest('li')?.previousElementSibling?.previousElementSibling?.querySelector('a');
                if (previousLink) {
                    previousLink.parentElement.previousElementSibling.scrollIntoView();
                    previousLink.click();
                }
                event.preventDefault();
                return;
            }

            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 'h') {
                if (!await clickButtonByText(['歷史記錄', '历史记录', '履歴記録', 'History'])) {
                    location.href = '/history';
                }
                event.preventDefault();
                return;
            }

            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 'p') {
                document.querySelector('#pptGenerate')?.click();
                event.preventDefault();
                return;
            }

            // 按下 f 就隱藏所有不必要的元素
            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 'f') {
                // Toggle 頁首
                document.querySelector('header')?.toggle();
                // Toggle 側邊欄
                document.querySelector('aside')?.toggle();

                // Toggle 文章註腳
                Array.from(document.querySelectorAll('span.footnote-ref')).forEach((e) => {
                    e.toggle();
                });

                // Toggle 資料來源
                Array.from(document.querySelectorAll('div.thread-item')).forEach((e) => {
                    e?.children[1]?.toggle();
                });

                let main = document.querySelector('main');
                if (!main) return;

                // Toggle 追問區
                Array.from(main.children).last()?.children?.[1]?.toggle();

                await toggle主要內容區();

                event.preventDefault();
                return;
            }

            // 按下 Alt+t 就先找出所有 button 元素，比對元素內容，如果為「主題集」就點擊它
            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 't') {
                console.log('Click on 主題集');
                if (!await clickButtonByText(['主題集', '主题集', 'トピック集', 'Topic Collections'])) {
                    console.log('Unable to click on 主題集, Redirecting to /topic');
                    location.href = '/topic';
                }
                event.preventDefault();
                return;
            }

            // 按下 Alt+s 就先找出所有 button 元素，比對元素內容，如果為「分享」就點擊它
            if (!isCtrlOrMetaKeyPressed(event) && event.key === 's') {
                // 如果是輸入欄位，就不要觸發。但是按下 alt+s 就可以觸發這個功能。
                if ((event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') && !event.altKey) {
                    return;
                }

                await clickButtonByText(['分享', '分享', '共有する', 'Share']);
                event.preventDefault();
                return;
            }

            // 按下 c 就點擊「建立主題」按鈕
            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 'c') {
                await clickButtonByText(['建立主題', '建立主题', 'トピックを作成', 'Create topic']);
                event.preventDefault();
                return;
            }

            // 按下 Ctrl+Delete 或 Command+Delete 快速刪除 Felo Search 討論串
            if (isCtrlOrMetaKeyPressed(event) && !event.altKey && event.key === 'Delete') {
                // 如果是輸入欄位，就不要觸發
                if (isInInputMode(event.target) && !!event.target.textContent && !confirm('是否要刪除本篇討論串？')) {
                    return;
                }

                await (await window.page.getByRole('button', undefined, document.querySelector('header')).last()).press('Enter');
                await window.page.getByRole('menuitem', { name: ['刪除討論串', '删除帖子', '投稿を削除', 'Delete Thread'] }).click();
                await window.page.getByRole('button', { name: ['確認', '确认', '確認', 'Confirm'] }).click()

                event.preventDefault();
                return;
            }

            // 按下 Ctrl+B 或 Command+B 快速切換側邊欄
            if (isCtrlOrMetaKeyPressed(event) && event.key === 'b') {
                // 找到 section 的 class 為「cursor-pointer」的元素
                const svg = document.querySelector('section.cursor-pointer svg');
                svg?.parentElement.click();
                event.preventDefault();
                return;
            }

            // 按下 Escape 就點擊 document.querySelector('img').click()
            if (!isCtrlOrMetaKeyPressed(event) && event.key === 'Escape') {
                // 如果有 [role='dialog'] 就不要觸發
                if (document.querySelector('[role="dialog"]')) {
                    return;
                }

                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {

                    // 只有在歷史紀錄頁面且搜尋欄位是空白時才會觸發
                    if (window.location.pathname.includes('/history') && event.target.value === '') {
                        window.history.back();
                    }

                    // 如果是編輯原始提問，就不要清空輸入框
                    if (event.target.nextElementSibling?.querySelectorAll('button').length == 2) {
                        event.target.nextElementSibling?.querySelectorAll('button')[0]?.click();
                        return;
                    }

                    if (event.target.value !== '') {
                        event.target.value = '';
                    }
                    return;
                }

                let backdropBlur = document.querySelector('div.backdrop-blur-md');
                if (!backdropBlur) {
                    goHome(); // 回首頁
                    event.preventDefault();
                    return;
                } else {
                    backdropBlur?.parentElement?.querySelector('button')?.click();
                }
            }

            // 按下 Alt+O 開啟第一個 iframe 網頁於新分頁
            if (!isInInputMode(event.target) && !isCtrlOrMetaKeyPressed(event) && event.altKey && event.key === 'o') {
                // 新增 alt+o 快捷鍵： open first iframe in new tab
                // Add alt+o hotkey: open the first frame URL in a new tab
                const frame = document.querySelector('iframe');
                if (frame && frame.src) {
                    window.open(frame.src, '_blank');
                }
                event.preventDefault();
                return;
            }
        });

        /**
         * 檢查給定的元素是否處於輸入模式。
         * 如果元素是輸入欄位、文字區域、可編輯內容的元素，或是屬於 shadow DOM 的一部分，
         * 則認為該元素處於輸入模式。
         *
         * @param {HTMLElement} element - 要檢查的元素。
         * @returns {boolean} - 如果元素處於輸入模式則返回 true，否則返回 false。
         */
        function isInInputMode(element) {
            // 如果元素是輸入欄位或文字區域，則處於輸入模式
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                return true;
            }
            // 如果元素是可編輯內容，則處於輸入模式
            if (element.isContentEditable) {
                return true;
            }
            // 如果元素屬於 shadow DOM 的一部分，則視為處於輸入模式 (也意味著不打算處理事件)
            if (element.shadowRoot instanceof ShadowRoot || (element.getRootNode && element.getRootNode() instanceof ShadowRoot)) {
                return true;
            }
            return false;
        }

        function goHome() {
            // 找到第一個 img 元素並點擊 (Felo Logo)
            document.querySelector('img')?.click();
        }

        // 延遲函式
        async function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function clickButtonByText(buttonTexts) {

            window.page.WAIT_TIMEOUT = 0;

            let btnLocator = window.page.getByRole('button', { name: buttonTexts });
            if (await btnLocator.isVisible()) {
                await btnLocator.click();
                return true;
            }

            // 某些按鈕並不是 button 的型態，所以只能比對文字去找
            btnLocator = window.page.getByText(buttonTexts, { exact: false });
            if (await btnLocator.isVisible()) {
                await btnLocator.click();
                return true;
            }

            window.page.WAIT_TIMEOUT = 5000;

            return false;
        }

        window.HTMLElement.prototype.show = function () {
            this.style.display = 'block';
        }

        window.HTMLElement.prototype.hide = function () {
            this.style.display = 'none';
        }

        window.HTMLElement.prototype.toggle = function () {
            // 判斷 this.existingStyleDisplay 屬性是否存在，如果不存在就設定為 this.style.display
            if (!this.hasOwnProperty('existingStyleDisplay')) {
                this.existingStyleDisplay = this.style.display;
            }

            // 設定 this.style.display 要跟 this.existingStyleDisplay 與 none 之間做切換
            this.style.display = this.style.display === 'none' ? this.existingStyleDisplay : 'none';
        }

        window.Array.prototype.last = function () {
            return this[this.length - 1];
        }

        async function toggle主要內容區() {
            window.page.WAIT_TIMEOUT = 0;

            let h1 = document.querySelectorAll('h1');
            let elements = Array.from(h1);
            if (elements.length == 0) return;

            elements.forEach((e) => {
                let parentNode = e?.closest('div.mb-6')?.parentElement.children;
                if (!parentNode) return;

                let contentElements = Array.from(parentNode);

                let blockHeader = contentElements[0];
                // console.log('blockHeader', blockHeader);

                let blockAnswerDone = contentElements[1];
                blockAnswerDone.toggle();
                // console.log('blockMetadata', blockMetadata);

                let blockRelated = contentElements[contentElements.length - 1];
                // 不一定有 Related 區塊，如果有，那一定是 DIV 標籤
                if (blockRelated.tagName !== 'DIV') {
                    blockRelated = undefined;
                }
                // console.log('blockRelated', blockRelated);

                let blockRelatedShift = blockRelated ? 0 : 1;
                let blockToolbar = contentElements[contentElements.length - 2 + blockRelatedShift];
                // console.log('blockToolbar', blockToolbar);

                let blockContent = contentElements[contentElements.length - 3 + blockRelatedShift];
                // console.log('blockContent', blockContent);

                // 不一定有心智圖
                let blockMindMap = contentElements[contentElements.length - 4 + blockRelatedShift];
                // console.log('blockMindMap', blockMindMap);

                if (!blockHeader || !blockAnswerDone || !blockContent || !blockToolbar) return;

                blockRelated?.toggle();
                blockToolbar.toggle();
                if (blockMindMap !== blockAnswerDone) {
                    blockMindMap?.toggle();
                }
            });

            window.page.WAIT_TIMEOUT = 5000;
        }
    }

    function check_for_felo_page_preview() {
        let felo_page_checker;

        if (window.location.pathname.includes('/page/')) {
            if (!!is_felo_page_enabled) return;

            is_felo_page_enabled = true;

            clearInterval(felo_page_checker);
            felo_page_checker = setInterval(() => {
                // if location.path contains /page/
                let page_toolbar = document.querySelector('main').firstElementChild.firstElementChild;
                if (!page_toolbar) return;

                // find last button element of page_toolbar
                let buttons = page_toolbar.querySelectorAll('button');
                if (buttons.length === 0) return;

                let last_button = buttons[buttons.length - 1];

                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'inline-flex';

                last_button.parentNode.insertBefore(wrapperDiv, last_button);
                wrapperDiv.appendChild(last_button);

                const clonedButton = last_button.cloneNode(true); // Clone with all descendants

                // if clonedButton is disabled
                if (clonedButton.disabled) return;

                clonedButton.innerText = '';

                // add SVG icon before text
                // <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link "><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                svgIcon.setAttribute("width", "24");
                svgIcon.setAttribute("height", "24");
                svgIcon.setAttribute("viewBox", "0 0 24 24");
                svgIcon.setAttribute("fill", "none");
                svgIcon.setAttribute("stroke", "currentColor");
                svgIcon.setAttribute("stroke-width", "2");
                svgIcon.setAttribute("stroke-linecap", "round");
                svgIcon.setAttribute("stroke-linejoin", "round");
                svgIcon.setAttribute("class", "lucide lucide-link");
                const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path1.setAttribute("d", "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71");
                const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path2.setAttribute("d", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71");
                svgIcon.appendChild(path1);
                svgIcon.appendChild(path2);
                clonedButton.insertBefore(svgIcon, clonedButton.firstChild);
                clonedButton.style.marginRight = '5px';
                clonedButton.title = 'Open in new tab (alt+o)';
                clonedButton.addEventListener('click', () => {
                    const firstIframe = document.querySelector('iframe');
                    if (firstIframe && firstIframe.src) {
                        window.open(firstIframe.src, '_blank');
                    }
                });

                wrapperDiv.insertBefore(clonedButton, last_button);

                clearInterval(felo_page_checker);
            }, 60);
        } else {
            if (!!felo_page_checker) clearInterval(felo_page_checker);
            is_felo_page_enabled = false;
        }
    }
})();
