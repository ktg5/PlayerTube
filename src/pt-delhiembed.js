/**
 * Inserts `element` next to `paste`
 * @param {string} element The element query name to move
 * @param {string} paste The element query name for the `element` value to be moved next to
 * @returns {void}
 */
function moveElement(element, paste) {
    let moveInt, tried = 0;

    function imove() {
        let elementDiv = document.querySelector(`${element}`);
        let pasteDiv = document.querySelector(`${paste}`);

        let logData = {
            elementStr: element,
            elementDiv: elementDiv,
            pasteStr: paste,
            pasteDiv: pasteDiv
        };

        if (
            elementDiv
            && pasteDiv
        ) {
            if (pasteDiv.contains(elementDiv)) {
                return console.error('moveElement: pasteDiv already has element', logData);
            } else if (elementDiv.parentElement.contains(elementDiv)) {
                pasteDiv.parentNode.insertBefore(elementDiv, pasteDiv.parentNode.firstElementChild);
                clearInterval(moveInt);
                return console.log('moveElement: move successful', logData)
            } else {
                return console.log('moveElement: something else failed', logData);
            }
        } else {
            return console.error('moveElement: elements can\'t be found.', logData);
        }
    }

    moveInt = setInterval(() => {
        if (tried >= 5) return clearInterval(moveInt);
        else {
            imove();
            tried++;
        }
    }, 500);
};


window.addEventListener('load', () => {
    moveElement('')
});
