// client-side: select text and generate pictures onto page


// hide all images
function hideAllImgs() {
    let allImgDivs = document.getElementById("imgcol").children;
    for (let i=0; i < allImgDivs.length; i++) {
        allImgDivs[i].hidden = true;
    }
}


// send text to server using fetch and ajax
// get back img url
// insert image onto page
function sendTextToGen(prompt, counter) {
    // create virtual form to send text to server
    const formData = new FormData();
    formData.append("prompt", prompt);

    fetch("/ajax",{
        method: "POST",
        body: formData
    }).then(function(response){
        return response.json();
    }).then(function(imgUrlPromise){
        hideAllImgs();
        let divRef = document.createElement("div");
        let imgRef = document.createElement("img");
        imgRef.id = "imgCount"+counter+"Img";
        imgRef.src = imgUrlPromise.url;
        divRef.appendChild(imgRef);
        divRef.className = "centered img";
        document.getElementById("imgcol").appendChild(divRef);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}


// change text color upon image generation request
function changeSelectedTextColor(counter) {
    let selected = window.getSelection();
    let range;
    if (selected.rangeCount && selected.getRangeAt) {
        range = selected.getRangeAt(0);
    }

    document.designMode = "on";

    if (range) {
        selected.removeAllRanges();
        selected.addRange(range);
    }

    if (selected.toString().slice(-2, -1) !== '\n' && selected.toString().slice(-1) === '\n')
        document.execCommand("insertHTML", false, "<span class=\"prevGenText\" id=\"imgCount"+counter+"Text\">"+(selected.toString()+'\n').replace(/(?:\r\n|\r|\n)/g, "<br />")+"</span>");
    else
        document.execCommand("insertHTML", false, "<span class=\"prevGenText\" id=\"imgCount"+counter+"Text\">"+selected.toString().replace(/(?:\r\n|\r|\n)/g, "<br />")+"</span>");

    document.designMode = "off";
}


// add event listener for on text hover: show img
function addListenerHoverForText(counter) {
    let textRef = document.getElementById("imgCount"+counter+"Text");

    textRef.addEventListener("mouseover", (event) => {
        let imgRef = document.getElementById("imgCount"+counter+"Img");
        event.target.style.color = "#507583";

        hideAllImgs();
        if (imgRef)
            imgRef.parentNode.hidden = false;
    }, false);

    textRef.addEventListener("mouseout", (event) => {
        let imgRef = document.getElementById("imgCount"+counter+"Img");
        event.target.style.color = "#B49082";
    }, false);
}



// text selection via user highlighting
let selectedText = "";
function gText() {
	selectedText = document.all ? document.selection.createRange().text : document.getSelection();
}


// event listeners on load
let artApp = (function() {

    // selection using highlighting
    document.onmouseup = gText;
    if (!document.all)
        document.captureEvents(Event.MOUSEUP);


    // clipboard paste button
    document.addEventListener("DOMContentLoaded", function() {
        let pasteButton = document.getElementsByTagName("button")[0];
        pasteButton.addEventListener("click", function() {
            navigator.clipboard.readText().then(
                (cliptext) => (document.getElementById("clipboard-paste").innerText = "\n" + cliptext + "\n\n"),
                (err) => console.log(err)
            );
            document.body.removeChild(document.getElementById("pastewrapper"));
        });
    });


    // on Enter, send text to server
    let imgCounter = 0;
    let lastReq = 0;
    document.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            if (Date.now() - lastReq >= 3000) {
                lastReq = Date.now();
                if (selectedText.toString().length < 50 || selectedText.toString().length > 2000)
                    alert("Please highlight between 50 and 2000 characters.");
                else {
                    sendTextToGen(selectedText.toString(), imgCounter);
                    changeSelectedTextColor(imgCounter);
                    addListenerHoverForText(imgCounter);
                    imgCounter++;
                }
            } else
                alert("Please wait at least three seconds between requests.");
        }
    });

    return null;
})();
