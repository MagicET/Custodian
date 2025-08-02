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
        setObservation((mutations, oneshotObserver) => {
            const textarea = document.getElementsByClassName("_chatTextarea_dzva7_1")[0];
            if (textarea != undefined) {
                const dummy = document.createElement("textarea");
                dummy.className = "_chatTextarea_dzva7_1";
                dummy.placeholder = "dummy\ndummy";
                dummy.style.setProperty("visibility", "hidden");
                dummy.style.setProperty("height", "1px", "important");
                dummy.style.setProperty("width", `${textarea.clientWidth}px`);
                document.body.appendChild(dummy)

                textarea.style.setProperty("transition", "border-color .2s, height .2s ease");

                const maximizingTextboxButton = document.createElement("input");
                maximizingTextboxButton.type = "checkbox";
                maximizingTextboxButton.className = "maximizingTextboxButton";

                if (featureFlags.maximizingTextbox == "appear") {
                    maximizingTextboxButton.style.setProperty("display", "none");
                }

                const maxedHeight = (() => {
                    const header = document.querySelector("._headerContainer_efl0u_1:has(._soundcloudPlayer_efl0u_43)");
                    if (header != undefined) {
                        return "calc(100vh - 7.4rem)";
                    }
                    return "calc(100vh - 5.8rem)";
                })();

                dummy.value = "a\na\na\na\na\na\na\na\na\na";
                const biggestScrollHeight = dummy.scrollHeight;
                maximizingTextboxButton.addEventListener("change", function () {
                    if (maximizingTextboxButton.checked) {
                        textarea.style.setProperty("height", maxedHeight, "important");
                    } else {
                        dummy.value = textarea.value;
                        if (dummy.scrollHeight < biggestScrollHeight) {
                            textarea.style.setProperty("height", `${dummy.scrollHeight}px`, "important");
                        } else {
                            textarea.style.setProperty("height", `${biggestScrollHeight}px`, "important");
                        }
                    }
                });
                textarea.parentElement.appendChild(maximizingTextboxButton);

                const observationConfig = { attributes: true, attributeFilter: ["style"] };

                dummy.value = "";
                const smallestScrollHeight = dummy.scrollHeight;
                const observationCallback = (() => {
                    if (featureFlags.maximizingTextbox == "replace") {
                        return (mutations, observer) => {
                            for (const mutation of mutations) {
                                if (maximizingTextboxButton.checked) {
                                    mutation.target.style.setProperty("height", maxedHeight, "important");
                                }
                            }
                        };
                    } else {
                        return (mutations, observer) => {
                            for (const mutation of mutations) {
                                if (mutation.target.scrollHeight > smallestScrollHeight) {
                                    maximizingTextboxButton.style.removeProperty("display");
                                } else {
                                    maximizingTextboxButton.style.setProperty("display", "none");                                    
                                }
                                if (maximizingTextboxButton.checked) {
                                    mutation.target.style.setProperty("height", maxedHeight, "important");
                                }
                            }
                        };
                    }
                })();
                const observer = new MutationObserver(observationCallback);

                observer.observe(textarea, observationConfig);
                oneshotObserver.disconnect();
            }
        });

        if (featureFlags.maximizingTextbox == "replace") {
            setObservation((mutations, observer) => {
                    const enhanceButton = document.getElementsByClassName("popover-container")[0];
                    if (enhanceButton != undefined) {
                        enhanceButton.remove();
                        observer.disconnect();
                    }
            });
        }
    }
})
