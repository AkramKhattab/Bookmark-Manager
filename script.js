document.addEventListener('DOMContentLoaded', () => {
    const siteName = document.getElementById("bookmarkName");
    const siteURL = document.getElementById("bookmarkURL");
    const siteCategory = document.getElementById("bookmarkCategory");
    const submitBtn = document.getElementById("submitBtn");
    const tableContent = document.getElementById("tableContent");
    const closeBtn = document.getElementById("closeBtn");
    const boxModal = document.querySelector(".box-info");
    const searchInput = document.getElementById("bookmarkSearch");
    const detailsModal = document.getElementById("detailsModal");
    const detailsContent = document.getElementById("detailsContent");
    const darkModeToggle = document.getElementById("darkModeToggle");

    let bookmarks = JSON.parse(localStorage.getItem("bookmarksList")) || [];
    let updateIndex = -1;

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const saveBookmarks = () => localStorage.setItem("bookmarksList", JSON.stringify(bookmarks));

    const clearInputFields = () => {
        siteName.value = "";
        siteURL.value = "";
        siteCategory.value = "";
        siteName.classList.remove("is-valid");
        siteURL.classList.remove("is-valid");
    };

    const resetSubmitButton = () => {
        submitBtn.textContent = "Submit";
        updateIndex = -1;
    };

    const validate = (element, regex) => {
        if (regex.test(element.value)) {
            element.classList.add("is-valid");
            element.classList.remove("is-invalid");
        } else {
            element.classList.add("is-invalid");
            element.classList.remove("is-valid");
        }
    };

    const displayBookmark = (index) => {
        const bookmark = bookmarks[index];
        const validURL = bookmark.siteURL.startsWith('http') ? bookmark.siteURL : `https://${bookmark.siteURL}`;
        tableContent.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${index + 1}</td>
                <td>${bookmark.siteName}</td>
                <td>${bookmark.category}</td>
                <td>
                    <button class="btn btn-visit" data-index="${index}">Visit</button>
                    <button class="btn btn-delete" data-index="${index}">Delete</button>
                    <button class="btn btn-update" data-index="${index}">Update</button>
                    <button class="btn btn-details" data-index="${index}">Details</button>
                </td>
            </tr>
        `);
    };

    const updateDisplay = () => {
        tableContent.innerHTML = "";
        bookmarks.forEach((_, index) => displayBookmark(index));
    };

    const handleSubmission = () => {
        saveBookmarks();
        updateDisplay();
        clearInputFields();
        resetSubmitButton();
    };

    const filterBookmarks = (query) => {
        tableContent.innerHTML = "";
        bookmarks.filter(bookmark => 
            bookmark.siteName.toLowerCase().includes(query) || 
            bookmark.siteURL.toLowerCase().includes(query)
        ).forEach((bookmark, index) => displayBookmark(index));
    };

    const addBookmark = () => {
        const bookmark = {
            siteName: capitalize(siteName.value),
            siteURL: siteURL.value,
            category: siteCategory.value,
            dateAdded: new Date().toLocaleString(),
            description: "A description of the site" // Placeholder; could be a user input
        };
        bookmarks.push(bookmark);
        handleSubmission();
    };

    const updateBookmark = (index) => {
        if (submitBtn.textContent === "Update" && siteName.classList.contains("is-valid") && siteURL.classList.contains("is-valid")) {
            bookmarks[index].siteName = capitalize(siteName.value);
            bookmarks[index].siteURL = siteURL.value;
            bookmarks[index].category = siteCategory.value;
            handleSubmission();
        } else {
            boxModal.classList.remove("d-none");
        }
    };

    const deleteBookmark = (e) => {
        const deletedIndex = e.target.dataset.index;
        bookmarks.splice(deletedIndex, 1);
        handleSubmission();
    };

    const visitWebsite = (e) => {
        const websiteIndex = e.target.dataset.index;
        const bookmark = bookmarks[websiteIndex];
        const validURL = bookmark.siteURL.startsWith('http') ? bookmark.siteURL : `https://${bookmark.siteURL}`;
        window.open(validURL, '_blank');
    };

    const updatePrepare = (e) => {
        updateIndex = e.target.dataset.index;
        siteName.value = bookmarks[updateIndex].siteName;
        siteURL.value = bookmarks[updateIndex].siteURL;
        siteCategory.value = bookmarks[updateIndex].category;
        submitBtn.textContent = "Update";
    };

    const showDetails = (index) => {
        const bookmark = bookmarks[index];
        detailsContent.innerHTML = `
            <p><strong>Name:</strong> ${bookmark.siteName}</p>
            <p><strong>URL:</strong> <a href="${bookmark.siteURL}" target="_blank">${bookmark.siteURL}</a></p>
            <p><strong>Category:</strong> ${bookmark.category}</p>
            <p><strong>Date Added:</strong> ${bookmark.dateAdded}</p>
            <p><strong>Description:</strong> ${bookmark.description}</p>
        `;
        detailsModal.classList.add("show");
    };

    const exportBookmarks = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "bookmarks.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importBookmarks = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            bookmarks = JSON.parse(e.target.result);
            handleSubmission();
        };
        reader.readAsText(file);
    };

    const toggleDarkMode = () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    };

    // Initial setup
    searchInput.addEventListener("input", () => filterBookmarks(searchInput.value.toLowerCase()));
    
    submitBtn.addEventListener("click", () => {
        if (siteName.classList.contains("is-valid") && siteURL.classList.contains("is-valid")) {
            if (submitBtn.textContent === "Submit") {
                addBookmark();
            } else if (submitBtn.textContent === "Update") {
                updateBookmark(updateIndex);
            }
        } else {
            boxModal.classList.remove("d-none");
        }
    });

    closeBtn.addEventListener("click", () => boxModal.classList.add("d-none"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") boxModal.classList.add("d-none"); });
    document.addEventListener("click", (e) => { if (e.target.classList.contains("box-info")) boxModal.classList.add("d-none"); });

    tableContent.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete")) {
            deleteBookmark(e);
        } else if (e.target.classList.contains("btn-visit")) {
            visitWebsite(e);
        } else if (e.target.classList.contains("btn-update")) {
            updatePrepare(e);
        } else if (e.target.classList.contains("btn-details")) {
            showDetails(e.target.dataset.index);
        }
    });

    document.getElementById("closeDetails").addEventListener("click", () => detailsModal.classList.remove("show"));
    document.getElementById("exportBtn").addEventListener("click", exportBookmarks);
    document.getElementById("importBtn").addEventListener("change", importBookmarks);
    darkModeToggle.addEventListener("click", toggleDarkMode);

    const nameRegex = /^\w{3,}(\s+\w+)*$/;
    const urlRegex = /^(https?:\/\/)?(www\.)?\w+\.\w{2,}(:\d{2,5})?(\/\w+)*$/;

    siteName.addEventListener("input", () => validate(siteName, nameRegex));
    siteURL.addEventListener("input", () => validate(siteURL, urlRegex));

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    updateDisplay();
});
