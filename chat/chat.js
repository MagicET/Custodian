fetchFeatureFlags().then((featureFlags) => {
    function setObservation(observationCallback) {
        const observationConfig = { childList: true, subtree: true };
        new MutationObserver(observationCallback).observe(document.body, observationConfig);
    }

    // changingEditingColor feature
    if (featureFlags.changingEditingColor) {
        const changingEditingColor = document.createElement("style");
        changingEditingColor.innerHTML = "._autoResizeTextarea_48ugw_1 { color: white !important; }";
        document.head.appendChild(changingEditingColor);
    }

    // hidingHeaderButton feature
    if (featureFlags.hidingHeader) {
        setObservation((mutations, observer) => {
            const header = document.getElementsByClassName("_headerContainer_efl0u_1")[0];
            if (header != undefined) {
                // working with CSS
                const hidingHeaderButton = document.createElement("input");
                hidingHeaderButton.type = "checkbox";
                hidingHeaderButton.className = "hidingHeaderButton";
                header.appendChild(hidingHeaderButton);
                observer.disconnect();
            }
        });
    }

    // maximizingTextbox feature
    if (featureFlags.maximizingTextbox != "none") {
        setObservation((mutations, observer) => {
            const textarea = document.getElementsByClassName("_chatTextarea_dzva7_1")[0];
            if (textarea != undefined) {
                // dummy to calculate the auto height for the textarea
                const dummy = document.createElement("textarea");
                dummy.className = "_chatTextarea_dzva7_1";
                dummy.placeholder = "dummy\ndummy";
                dummy.style.setProperty("visibility", "hidden");
                dummy.style.setProperty("height", "1px", "important");
                dummy.style.setProperty("width", `${textarea.clientWidth}px`);
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
                    const header = document.querySelector("._headerContainer_efl0u_1:has(._soundcloudPlayer_efl0u_43)");
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

                observer.disconnect();
            }
        });

        // hide the ellipsis button showing the "enhance msg" popup when pressed
        if (featureFlags.maximizingTextbox == "replace") {
            setObservation((mutations, observer) => {
                const enhanceButton = document.getElementsByClassName("popover-container")[0];
                if (enhanceButton != undefined) {
                    enhanceButton.style.setProperty("display", "none");
                    observer.disconnect();
                }
            });
        }
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
