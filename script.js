const textArea = document.getElementById("textToConvert");
const convertBtn = document.getElementById("convertBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const voiceSelect = document.getElementById("voiceSelect");
const rateInput = document.getElementById("rate");
const pitchInput = document.getElementById("pitch");
const errorPara = document.querySelector('.error-para');
const pdfUpload = document.getElementById("pdfUpload");

let speechSynth = window.speechSynthesis;
let voices = [];
let utterance;

// Load Available Voices
function loadVoices() {
    voices = speechSynth.getVoices();
    voiceSelect.innerHTML = "";
    
    voices.forEach((voice, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

// Reload voices when voices are loaded
speechSynth.addEventListener("voiceschanged", loadVoices);

// Convert Text to Speech
convertBtn.addEventListener("click", function () {
    let textToConvert = textArea.value.trim();

    if (!textToConvert) {
        errorPara.textContent = "Nothing to convert! Enter text or upload a PDF.";
        return;
    }

    if (speechSynth.speaking) {
        return;
    }

    errorPara.textContent = "";
    utterance = new SpeechSynthesisUtterance(textToConvert);

    // Set voice, rate, and pitch
    utterance.voice = voices[voiceSelect.value];
    utterance.rate = rateInput.value;
    utterance.pitch = pitchInput.value;

    // Change button text when playing
    utterance.onstart = () => convertBtn.textContent = "Playing...";
    utterance.onend = () => convertBtn.textContent = "Play";

    speechSynth.speak(utterance);
});

// Pause Speech
pauseBtn.addEventListener("click", function () {
    if (speechSynth.speaking && !speechSynth.paused) {
        speechSynth.pause();
        pauseBtn.textContent = "Resume";
    } else if (speechSynth.paused) {
        speechSynth.resume();
        pauseBtn.textContent = "Pause";
    }
});

// Stop Speech
stopBtn.addEventListener("click", function () {
    if (speechSynth.speaking) {
        speechSynth.cancel();
        convertBtn.textContent = "Play";
        pauseBtn.textContent = "Pause";
    }
});

// Upload PDF and Extract Text
pdfUpload.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const pdfData = new Uint8Array(e.target.result);
            pdfjsLib.getDocument(pdfData).promise.then(function (pdf) {
                let text = "";
                const totalPages = pdf.numPages;

                // Extract text from each page
                for (let i = 1; i <= totalPages; i++) {
                    pdf.getPage(i).then(function (page) {
                        page.getTextContent().then(function (content) {
                            content.items.forEach(item => {
                                text += item.str + " ";
                            });

                            // Once all pages are processed, update the text area
                            if (i === totalPages) {
                                textArea.value = text;
                            }
                        });
                    });
                }
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        errorPara.textContent = "Please upload a valid PDF file.";
    }
});
