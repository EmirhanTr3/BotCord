async function settingsOpened() {
    //! close settings button
    document.querySelector("#settings #close").addEventListener("click", () => {
        document.getElementById("settings").remove()
    })

    //! logout button
    document.querySelector("#leftbar #buttons #logout").addEventListener("click", (e) => {
        e.preventDefault()
        showConfirmationBox(
            "Are you sure about this action?",
            "Are you sure you want to log out of your current bot account?",
            () => ipcRenderer.send("logout"),
            () => {}
        )
    })
}