fetchFeatureFlags().then((featureFlags) => {
    function executeTo(getElement, execute) {
        const observationConfig = { childList: true, subtree: true };

        const element = getElement();
        if (element) {
            // working with CSS
            execute(element);
        } else {
            new MutationObserver((mutations, observer) => {
                const element = getElement();
                if (element != undefined) {
                    execute(element);
                    observer.disconnect();
                }
            }).observe(document.body, observationConfig);
        }
    }

    // changingEditingColor feature
    if (featureFlags.changingEditingColor) {
        const changingEditingColor = document.createElement("style");
        changingEditingColor.innerHTML = "._autoResizeTextarea_48ugw_1 { color: white !important; }";
        document.head.appendChild(changingEditingColor);
    }

    // hidingHeaderButton feature
    if (featureFlags.hidingHeader) {
        executeTo(
            () => document.querySelector('div[class^="_chatLayoutContainer"] div[class^="_headerContainer"]'),
            (header) => {
                // working with CSS
                const hidingHeaderButton = document.createElement("input");
                hidingHeaderButton.type = "checkbox";
                hidingHeaderButton.className = "hidingHeaderButton";
                header.appendChild(hidingHeaderButton);
            }
        )
    }

    // maximizingTextbox feature
    if (featureFlags.maximizingTextbox != "none") {
        executeTo(
            () => document.querySelector('textarea[class^="_chatTextarea"]'),
            (textarea) => {
                // dummy to calculate the auto height for the textarea
                const dummy = document.createElement("textarea");
                dummy.className = textarea.className;
                dummy.placeholder = "dummy\ndummy";
                dummy.style.setProperty("visibility", "hidden");
                dummy.style.setProperty("height", "1px", "important");
                dummy.style.setProperty("width", `${textarea.clientWidth}px`);
                dummy.style.setProperty("position", "absolute");
                dummy.style.setProperty("top", "0px");
                document.body.appendChild(dummy)
                
                // border-color is already in Janitor's code
                textarea.style.setProperty("transition", "border-color .2s, height .2s ease");

                
                const maximizingTextboxButton = document.createElement("input");
                maximizingTextboxButton.type = "checkbox";
                maximizingTextboxButton.className = "maximizingTextboxButton";

                if (featureFlags.maximizingTextbox == "appear") {
                    maximizingTextboxButton.style.setProperty("display", "none");
                }
                
                // set the maximized height depending on whether there is the soundcloud player in the header
                const maxedHeight = (() => {
                    const header = document.querySelector('div[class^="_headerContainer"]:has([class^="_soundcloudPlayer"])');
                    if (header != undefined) {
                        return "calc(100vh - 7.4rem)";
                    }
                    return "calc(100vh - 5.8rem)";
                })();

                // the number of max lines is 10
                dummy.value = "a\na\na\na\na\na\na\na\na\na";
                const biggestScrollHeight = dummy.scrollHeight;
                maximizingTextboxButton.addEventListener("change", function () {
                    if (maximizingTextboxButton.checked) {
                        textarea.style.setProperty("height", maxedHeight, "important");
                    } else {
                        // adjusting the height to the content. if the content is more than 10 lines (maximum) the height will be capped
                        dummy.value = textarea.value;
                        if (dummy.scrollHeight < biggestScrollHeight) {
                            textarea.style.setProperty("height", `${dummy.scrollHeight}px`, "important");
                        } else {
                            textarea.style.setProperty("height", `${biggestScrollHeight}px`, "important");
                        }
                    }
                });
                textarea.parentElement.appendChild(maximizingTextboxButton);

                // running when the height is changed automatically
                const observationConfig = { attributes: true, attributeFilter: ["style"] };

                // the number of minimum lines is 2 and that is guaranteed by the "placeholder" attribute
                dummy.value = "";
                const smallestScrollHeight = dummy.scrollHeight;
                const observationCallback = (() => {
                    if (featureFlags.maximizingTextbox == "replace") {
                        return (mutations, observer) => {
                            if (textarea.value == "") {
                                maximizingTextboxButton.checked = false;
                            }
                            if (maximizingTextboxButton.checked) {
                                textarea.style.setProperty("height", maxedHeight, "important");
                            }
                        };
                    } else {
                        return (mutations, observer) => {
                            // if "appear" is selected, the button appears only when the number of lines are more than 2 so the button won't overlap on the "enhance msg" ellipsis
                            if (textarea.scrollHeight > smallestScrollHeight) {
                                maximizingTextboxButton.style.removeProperty("display");
                            } else {
                                maximizingTextboxButton.style.setProperty("display", "none");                                    
                            }

                            // the rest is the same
                            if (textarea.value == "") {
                                maximizingTextboxButton.checked = false;
                            }
                            if (maximizingTextboxButton.checked) {
                                textarea.setProperty("height", maxedHeight, "important");
                            }
                        };
                    }
                })();
                new MutationObserver(observationCallback).observe(textarea, observationConfig);
            }
        );

        // hide the ellipsis button showing the "enhance msg" popup when pressed
        if (featureFlags.maximizingTextbox == "replace") {
            executeTo(
                () => document.getElementsByClassName("popover-container")[0],
                (enhanceButton) => {
                    enhanceButton.style.setProperty("display", "none");
                }
            );
        }
    }

    // thinkBox feature
    if (featureFlags.thinkBox != "none") {
        executeTo(
            () => document.querySelector('[class^="_messagesMain"] > div > div > div:has([class^="_messageDisplayWrapper"])'),
            (messageContainer) => {
                document.body.style.setProperty('--max-thinkbox-height', featureFlags.thinkBoxHeight + "rem")

                function applyThinkBox(message) {
                    messageMain = message.querySelector('& > div[class^="css"]');

                    const walker = document.createTreeWalker(messageMain, NodeFilter.SHOW_TEXT)
                    
                    tags = [];

                    while (walker.nextNode()) {
                        const node = walker.currentNode;
                        for (const match of node.textContent.matchAll(/<(\/*)(.+?)>/g)) {
                            if (match[1].includes("/")) {
                                tag = tags.findLast((tag) => {
                                    return tag.name == match[2] && !tag.closed
                                })
                                if (tag) {
                                    tag.range.setEnd(node, match.index + match[0].length);
                                    tag.closed = true
                                }
                            } else {
                                tags.push({name: match[2], range: document.createRange(), closed: false});
                                tags[tags.length - 1].range.setStart(node, match.index);
                            }
                        }
                    }
                    

                    for (const tag of tags) {
                        if (featureFlags.thinkBox == "hide") {
                            tag.range.deleteContents();
                            continue;
                        }
                        if (tag.range.collapsed) {
                            continue;
                        }
                        box = document.createElement("div");
                        box.className = "custodianThinkBox";
                        tagName = document.createElement("div");
                        tagName.className = "thinkBoxName";
                        if (tag.name == "think") {
                            tagName.textContent = "Thinking";
                        } else {
                            tagName.textContent = tag.name;
                        }
                        toggle = document.createElement("input");
                        toggle.type = "checkbox";
                        toggle.className = "thinkBoxToggle";
                        if (featureFlags.thinkBox == "folded") {
                            toggle.checked = true;
                        }
                        if (featureFlags.thinkBox == "opened") {
                            toggle.checked = false;
                        }
                        header = document.createElement("div");
                        header.className = "thinkBoxHeader";
                        header.append(tagName);
                        header.append(toggle);
                        box.append(header);

                        textContainer = document.createElement("div");
                        textContainer.className = "thinkBoxTextContainer";
                        clone = tag.range.cloneContents();
                        textContainer.append(clone);
                        box.append(textContainer);
                        tag.range.deleteContents();
                        tag.range.insertNode(box);
                    }
                }

                messages = messageContainer.querySelectorAll('div[class^="_messageBody"]');
                for (const message of messages) {
                    applyThinkBox(message)
                }

                new MutationObserver((mutations, observer) => {
                    messages = messageContainer.querySelectorAll('div[class^="_messageBody"]:not(:has(textarea, .custodianThinkBox))');
                    for (const message of messages) {
                        applyThinkBox(message)
                    }
                }).observe(messageContainer, { childList: true, subtree: true });
            }
        )
    }

    // appearance feature
    if (featureFlags.appearance != "dark") {
        const style = document.createElement("style");
        style.textContent = `body{
                filter: invert(1) hue-rotate(180deg);
            }
            img {
                filter: invert(1) hue-rotate(180deg);
            }
            div[class^="_chatLayoutContainer"] { 
                background-color: black; 
            } 
            div[class^="_headerContainer"] { 
                box-shadow: 0 4px 6px #ffffff1a, 0 2px 4px #ffffff0f;
                background-color: #34343405;
            }
            textarea[class^="_chatTextarea"] {
                background-color: #34343405;
            }
        `;
        if (featureFlags.appearance == "system") {
            style.media = "all and (prefers-color-scheme: light)"
        }
        document.head.appendChild(style);
    }
})
