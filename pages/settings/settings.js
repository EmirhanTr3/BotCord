async function settingsOpened() {
    //! close settings button
    document.querySelector("#settings #close").addEventListener("click", () => {
        document.getElementById("settings").remove()
    })

    //! logout button
    document.querySelector("#settings #leftbar #buttons #logout").addEventListener("click", (e) => {
        e.preventDefault()
        showConfirmationBox(
            "Are you sure about this action?",
            "Are you sure you want to log out of your current bot account?",
            () => ipcRenderer.send("logout"),
            () => {}
        )
    })

    //! color picker - main, secondary
    function colorpicker(prop, div, input, def) {
        input.addEventListener("change", (e) => {
            div.style.backgroundColor = input.value
            document.documentElement.style.setProperty(prop, input.value)
        })
        div.style.backgroundColor = document.documentElement.style.getPropertyValue(prop) || def
        input.value = document.documentElement.style.getPropertyValue(prop) || def
    }

    colorpicker(
        "--main-color",
        document.querySelector("#settings #content #maincolor"),
        document.querySelector("#settings #content #maincolor input"),
        "#222222"
    )

    colorpicker(
        "--secondary-color",
        document.querySelector("#settings #content #secondarycolor"),
        document.querySelector("#settings #content #secondarycolor input"),
        "#303030"
    )

}