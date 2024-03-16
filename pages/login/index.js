const { ipcRenderer } = require("electron");

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault()
    const token = document.querySelector("input").value
    ipcRenderer.send("login", token)
})