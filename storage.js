const defaultFeatureFlags = { appearance: "dark", changingEditingColor: true, hidingHeader: true, maximizingTextbox: "replace", showingLinkedImage: true };

async function fetchFeatureFlags() {
    let featureFlags = defaultFeatureFlags;

    await chrome.storage.local.get(["featureFlags"]).then((data) => {
        // if not blank
        if (Object.keys(data) != 0) {
            for (const key of Object.keys(featureFlags)) {
                if (data.featureFlags[key] != undefined) {
                    featureFlags[key] = data.featureFlags[key];
                }
            }
        }
    })

    return featureFlags;
}