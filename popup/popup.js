for (const anchor of document.getElementsByTagName("a")) {
    anchor.onclick = function () {
        chrome.tabs.create({url: anchor.href});
    }
}

fetchFeatureFlags().then((featureFlags) => {
    for (const key of Object.keys(featureFlags)) {
        const element = document.getElementById(key);
        switch (element.tagName) {
            case "INPUT":
                if (element.type == "checkbox") {
                    element.checked = featureFlags[key];
                    element.addEventListener("change", (e) => {
                        featureFlags[key] = e.target.checked;
                        chrome.storage.local.set({"featureFlags": featureFlags});
                        document.getElementById("reloadAlert").style.setProperty("color", "white");
                    });
                } else {
                    console.log(featureFlags[key]);
                    console.log(key)
                    element.value = featureFlags[key];
                    element.addEventListener("input", (e) => {
                        console.log("changed", e.target.value)
                        featureFlags[key] = e.target.value;
                        chrome.storage.local.set({"featureFlags": featureFlags});
                        document.getElementById("reloadAlert").style.setProperty("color", "white");
                    });
                }
                break;
            case "SELECT":
                element.value = featureFlags[key];
                element.addEventListener("change", (e) => {
                    featureFlags[key] = e.target.value;
                    chrome.storage.local.set({"featureFlags": featureFlags});
                    document.getElementById("reloadAlert").style.setProperty("color", "white");
                });
                break;
            default:
                console.error("error getting type", element.tagName);
                break;
        }
    }
});