console.log("characterPage.js loaded");
fetchFeatureFlags().then((featureFlags) => {
    function setObservation(observationCallback) {
        const observationConfig = { childList: true, subtree: true };
        new MutationObserver(observationCallback).observe(document.body, observationConfig);
    }

    function deepChildNodes(element) {
        let nodes = []
        for (const child of element.childNodes) {
            nodes.push(child);
            nodes = nodes.concat(deepChildNodes(child));
        }
        return nodes;
    }

    function enableFeatures() {
        //showingLinkedImage feature
        if (featureFlags.showingLinkedImage != "none") {
            setObservation((mutation, observer) => {
                const characterDescription = document.getElementsByClassName("css-2h3yxp")[0];
                if (characterDescription != undefined) {
                    for (const child of deepChildNodes(characterDescription)) {
                        if (child.tagName == "A") {
                            const img = document.createElement("img");
                            img.src = decodeURIComponent(child.href.replace(/.*?to=/, ""));
                            img.style.setProperty("max-height", "85vh");
                            img.style.setProperty("margin", "0 auto");
                            child.appendChild(img);
                            img.onerror = function () {
                                img.remove();
                            };
                        }
                    }
                    observer.disconnect();
                }
            });
        }
    }

    let oldUrl = location.href;
    
    new MutationObserver((mutations, observer) => {
        if(oldUrl != location.href) {
            oldUrl = location.href;
            if (location.href.includes("https://janitorai.com/characters/")) {
                enableFeatures();
            }
        }
    }).observe(document.head, {childList: true});

    if (location.href.includes("https://janitorai.com/characters/")) {
        enableFeatures();
    }
});