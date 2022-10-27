// preload.js

//+
// Author:  Mark H. Shin.  Copyright © 2022 telemark software®
//-

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron');

// When document has loaded, initialize
document.onreadystatechange = (event) => {
	if (document.readyState == "complete") {
		handleWindowControls();
		// Tiny hack so app does not start with blank white screen...
		setTimeout(() => {
			document.body.style.backgroundColor = "#c0c0c0";
		}, 1000);
	}
};

window.onbeforeunload = (event) => {
	/* If window is reloaded, remove win event listeners
	(DOM element listeners get auto garbage collected but not
	Electron win listeners as the win is not dereferenced unless closed) */
	//win.removeAllListeners();
}

function handleWindowControls() {
	// Make minimize/maximize/restore/close buttons work when they are clicked
	document.getElementById('min-button').addEventListener("click", event => {
		ipcRenderer.send('minimize');
	});
	document.getElementById('max-button').addEventListener("click", event => {
		ipcRenderer.send('maximize');
		// Toggle to restore button when maximization occurs
		document.body.classList.add('maximized');
	});
	document.getElementById('restore-button').addEventListener("click", event => {
		ipcRenderer.send('unmaximize');
		// Toggle to maximize button when unmaximization occurs
		document.body.classList.remove('maximized');
	});
	document.getElementById('close-button').addEventListener("click", event => {
		ipcRenderer.send('close');
	});
	// Console tray
	document.getElementById('console').onclick = function() {
		ipcRenderer.send('console');
	};

	// Initialize titlebar icon based on startup maximisation/unmaximisation state
	ipcRenderer.invoke('ismaximized').then((ismaximized) => {
		(ismaximized) ? document.body.classList.add('maximized') : document.body.classList.remove('maximized');
	});

	// Add mouse events to titlebar portion that is non-draggable (i.e. window-controls div).
	document.getElementById('titlebar').onmouseenter = function() {
		if (process.platform !== 'darwin') {
			// Set window control buttons as visible.
 			for (const type of ['min', 'max', 'restore', 'close']) {
				document.getElementById(`${type}-button`).style.visibility = 'visible';
			}
		}
	};
	document.getElementById('titlebar').onmouseleave = function() {
		if (process.platform !== 'darwin') {
			// Set window control buttons as hidden.
			for (const type of ['min', 'max', 'restore', 'close']) {
				document.getElementById(`${type}-button`).style.visibility = 'hidden';
			}
		}
	};
}
