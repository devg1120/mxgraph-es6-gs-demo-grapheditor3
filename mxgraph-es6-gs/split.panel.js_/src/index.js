import { getTopZIndex, eventCoordinateFromElement, NumberFromStyle } from "./toolkit/src/domKits";
import { assert } from "./toolkit/src/assert";
import SplitType from "./splitType";

// the private member
const $private = Symbol("split.panel.js");

function resizePanel(_posDelta, _index) {
    if (_posDelta !== 0) {
        // prepare the vars for calculating the information for modifying panels
        const type = this[$private].type;
        const modifyPanels = [];
        let sizeExpand = 0;
        const { indexStep, expandIndex, expandRecFn } = (_posDelta > 0) ? {
            indexStep: 1,
            expandIndex: _index - 1,
            expandRecFn: Array.prototype.unshift
        } : (_posDelta = -_posDelta, {
            indexStep: -1,
            expandIndex: _index--,
            expandRecFn: Array.prototype.push
        });

        // calculate the information for modifying panels
        for (let panel = this.querySelector(`:scope>[d-split-panel="${_index}"]`);
                panel && (_posDelta > 0); 
                panel = this.querySelector(`:scope>[d-split-panel="${_index += indexStep}"]`)) {
            const style = getComputedStyle(panel);
            const minSize = NumberFromStyle(style[type.minSize]);
            (minSize < 0) && (minSize = 0);
            const size = NumberFromStyle(style[type.size], minSize);
            let sizeDelta = size - minSize;
            if (sizeDelta > _posDelta) {
                sizeDelta = _posDelta;
            }
            if (sizeDelta > 0) {
                modifyPanels.push({
                    panel,
                    index: _index,
                    size: size - sizeDelta
                });
                _posDelta -= sizeDelta;
                sizeExpand += sizeDelta;
            } else {
                modifyPanels.push({
                    panel,
                    index: _index,
                    size: undefined
                });
            }
        }
        const expandPanel = this.querySelector(`:scope>[d-split-panel="${expandIndex}"]`);
        expandPanel && (sizeExpand > 0) && expandRecFn.call(modifyPanels, {
            panel: expandPanel,
            index: expandIndex,
            size: NumberFromStyle(getComputedStyle(expandPanel)[type.size]) + sizeExpand
        });
        
        // modify the panels
        modifyPanels.forEach(({panel, index, size}) => {
            if (size !== undefined) {
                panel.style[type.size] = `${size}px`;
            }
            const bar = this.querySelector(`:scope>[d-split-bar="${index}"]`);
            bar && (bar.style[type.setStart] = `${panel[type.start]}px`);
        });

        return (sizeExpand > 0);
    }
}

/**
 * the event handlers of the splitpanel
 * @ignore
 */
const eventHandlers = {
    /**
     * handler of auto swap the size of the panel
     * @param {*} _e 
     */
    onAutoSwap(_e) {
        let panelIndex;
        // peek the index of panel that will be swap
        if (_e.type === "dblclick") {
            panelIndex = _e.target ? NumberFromStyle(_e.target.getAttribute("d-split-bar"), -1) : -1;
            this.querySelector(`:scope>*[d-split-panel="${panelIndex}"]:not([d-split-noautoswap])`) || (panelIndex = -1);
        } else {
            for (let item of _e.composedPath()) {
                panelIndex = (item instanceof HTMLElement ? NumberFromStyle(item.getAttribute("d-split-panel"), -1) : -1);
                if (panelIndex >= 0) {
                    break;
                }
            }
        }
        // processing swap
        if (panelIndex >= 0) {
            const splitObj = this[$private];
            const opt = (splitObj.opt || {});
            if (_e.type !== "dblclick" || opt.autoswap) {
                const panel = this.querySelector(`:scope>*[d-split-panel="${panelIndex}"]`);
                if (panel) {
                    const type = splitObj.type;
                    const style = getComputedStyle(panel);
                    const minSize = NumberFromStyle(style[type.minSize]);
                    const size = NumberFromStyle(style[type.size]);
                    let posDelta;
                    if (minSize < size) {
                        posDelta = size - minSize;
                        panel.setAttribute("d-split-autoswap", size);
                    } else {
                        posDelta = minSize - (NumberFromStyle(panel.getAttribute("d-split-autoswap")) || (minSize + (Number(opt.swapsize) || 26)));
                    }
                    if (panelIndex === 0) {
                        panelIndex = 1;
                        posDelta = -posDelta;
                    }
                    resizePanel.call(this, posDelta, panelIndex);
                }
            }
            _e.stopPropagation();
            _e.preventDefault();
        }
    },
    /**
     * handler of mouseup
     * @param {*} _e 
     */
    onMouseUp(_e) {
        const splitObj = this[$private];
        if (splitObj) {
            splitObj.currentIndex = undefined;
            window.removeEventListener("mousemove", splitObj.onMouseMove)
        }
    },
    /**
     * handler of mousemove
     * @param {*} _e 
     */
    onMouseMove(_e) {
        const splitObj = this[$private];
        if (splitObj) {
            // peek the movement information
            const type = splitObj.type;
            let pos = eventCoordinateFromElement(_e, this)[type.eventPos];
            const containerSize = this[type.clientSize];
            if (pos < 0) {
                pos = 0;
            } else if (pos >= containerSize) {
                pos = containerSize - 1;
            }
            resizePanel.call(this, pos - splitObj.lastPos, splitObj.currentIndex) && (splitObj.lastPos = pos);
        }
    },
    /**
     * handler of mousedown
     * @param {*} _e 
     */
    onMouseDown(_e) {
        const splitObj = this[$private];
        const currentIndex = _e.target ? NumberFromStyle(_e.target.getAttribute("d-split-bar")) : 0;
        if (splitObj && currentIndex > 0) {
            splitObj.currentIndex = currentIndex;
            splitObj.lastPos = eventCoordinateFromElement(_e, this)[splitObj.type.eventPos];
            window.addEventListener("mousemove", splitObj.onMouseMove);
            window.addEventListener("mouseup", splitObj.onMouseUp, { once: true });
            _e.stopPropagation();
            _e.preventDefault();
        }
    },
    /**
     * handler of resize
     */
    onResize() {
        arrangeView(this, this[$private]);
    }
}

/**
 * arrange the total split view
 * @param {HTMLElement} _containerElement the HTMLElement as the container of the split view 
 * @param {Object} _splitObj the private data of the split view
 * @ignore
 */
function arrangeView(_containerElement, _splitObj) {
    const type = _splitObj.type;

    // get all contents and their attributes
    const contents = [];
    let lastEndMargin = 0;
    [..._containerElement.querySelectorAll(":scope>*:not(.-split-bar)")].forEach((element, index) => {
        element.classList.add("-split-panel");
        element.setAttribute("d-split-panel", index);
        const style = getComputedStyle(element);
        let minSize = NumberFromStyle(style[type.minSize]);
        (minSize < 0) && (minSize = 0);
        let maxSize = NumberFromStyle(style[type.maxSize]);
        (maxSize < 0) && (maxSize = 0);
        const size = NumberFromStyle(style[type.size], minSize);
        contents.push({
            element,
            minSize,
            maxSize,
            size,
            index,
            margin: lastEndMargin + NumberFromStyle(style[type.beginMargin]),
            auto: Boolean(element.getAttribute("d-split-auto"))
        });
        lastEndMargin = NumberFromStyle(style[type.endMargin]);
    });

    // calculate size of each content
    const containerSize = _containerElement[type.clientSize] - contents.reduce((a, b) => (Number(a) || a.margin) + b.margin);
    let totalMinSize = 0, totalSpecifiedSize = 0, autoCount = 0, totalAutoMinSize = 0;
    contents.forEach(content => {
        totalMinSize += content.minSize;
        content.auto ? (autoCount ++, totalAutoMinSize += content.minSize) : (totalSpecifiedSize += content.size);
    });
    let totalAutoSize = containerSize - totalSpecifiedSize;
    if (totalAutoSize < totalAutoMinSize) {
        let deltaSize = totalAutoMinSize - totalAutoSize;
        contents.forEach(content => {
            if (deltaSize > 0 && !content.auto) {
                let itemDelta = content.size - content.minSize;
                if (itemDelta > 0) {
                    if (itemDelta >= deltaSize) {
                        itemDelta = deltaSize;
                    }
                    content.size -= itemDelta;
                    deltaSize -= itemDelta;
                }
            }
        });
        totalAutoSize = totalAutoMinSize;
    }
    let eachAutoSize = (autoCount > 0) ? (totalAutoSize / autoCount) 
                        : (contents[0].element.setAttribute("d-split-auto", "true"), contents[0].auto = true, totalAutoSize);
    
    // locating
    const bars = [null, ..._containerElement.querySelectorAll(":scope>.-split-bar")];
    contents.forEach(({ element, index, auto, size }) => {
        element.style[type.size] = `${auto ? eachAutoSize: size}px`;
        const bar = bars[index];
        if (bar) {
            bar.setAttribute("d-split-bar", index);
            bar.style[type.setStart] = `${element[type.start]}px`;
        }
    });
}

/**
 * initialize a splite view
 * @param {HTMLElement} _containerElement the element of the split view container
 * @param {String|Object} [_typeOrOpt] type of the split view or the options of the view.
 * @param {String} [_typeOrOpt.type="horizontal"] type of the split view, can be set as "horizontal" or "vertical"
 * @param {Boolean} [_typeOrOpt.autoswap=true] if the panel can be swap size when double click the split bar
 * @param {Number} [_typeOrOpt.swapsize=26] the delta size when swaping a panel to big status if the panel has no specified size
 */
 function init(_containerElement, _typeOrOpt) {
    assert(_containerElement instanceof HTMLElement, "the container element must be an instance of HTMLElement");

    // prepare the private data
    const { type, opt } = (typeof _typeOrOpt === "string" ? { type: _typeOrOpt, opt: {}} : {type: undefined, opt: _typeOrOpt || {}});
    (opt.autoswap === undefined) && (opt.autoswap = true);
    const splitObj = (_containerElement[$private] = { type: SplitType(type), opt });
    for (let event in eventHandlers) {
        splitObj[event] = eventHandlers[event].bind(_containerElement);
    }

    // initialize the container's attributes and event handlers
    _containerElement.style.padding = "0px !important";
    _containerElement.classList.add("-split-container", `-split-container-${splitObj.type}`);
    _containerElement.addEventListener("mousedown", splitObj.onMouseDown);
    _containerElement.addEventListener("dblclick", splitObj.onAutoSwap);
    _containerElement.addEventListener("splitautoswap", splitObj.onAutoSwap);
    const resizeObserver = new ResizeObserver(splitObj.onResize);
    resizeObserver.observe(_containerElement);

    // initialize the view
    resetView(_containerElement);
}

/**
 * dispose a split view
 * @param {HTMLElement} _containerElement the element of the split view container
 */
function dispose(_containerElement) {
    if (_containerElement[$private] && (_containerElement instanceof HTMLElement)) {
        const splitObj = _containerElement[$private];
        // remove the event handler;
        _containerElement.removeEventListener("mousedown", splitObj.onMouseDown);
        window.removeEventListener("mouseup", splitObj.onMouseUp);
        window.removeEventListener("mousemove", splitObj.onMouseMove);
        _containerElement.removeEventListener("dblclick", splitObj.onAutoSwap);
        _containerElement.removeEventListener("splitautoswap", splitObj.onAutoSwap);

        // remove the addition element and attribute
        [..._containerElement.querySelectorAll(":scope>.-split-bar")].forEach(item => item.remove());
        [..._containerElement.querySelectorAll(":scope>.-split-panel")].forEach(item => {
            item.classList.remove("-split-panel");
            item.removeAttribute("d-split-panel");
            item.removeAttribute("d-split-autoswap");
        });
        _containerElement.classList.remove("-split-container", `-split-container-${splitObj.type}`);

        // release the private data
        _containerElement[$private] = undefined;
        delete _containerElement[$private];
    }
}

/**
 * trigger swaping the size of the panel
 * @param {HTMLElement} _element the element of the panel or an descendant element in the panel
 */
function swap(_element) {
    assert(_element instanceof HTMLElement, "the parameter must be an instance of HTMLElement");
    const event = new CustomEvent("splitautoswap", { bubbles: true });
    _element.dispatchEvent(event);
}

/**
 * reset the split view.
 * If change the contents of the view, you must call this function to reset the view.
 * @param {HTMLElement} _containerElement the element of the splite view container
 */
 function resetView(_containerElement) {
    assert(_containerElement instanceof HTMLElement, "the container element must be an instance of HTMLElement");
    const splitObj = assert(_containerElement[$private], "the container referenced not been initialized");

    [..._containerElement.querySelectorAll(":scope>.-split-bar")].forEach(item => item.remove());

    const contentCount = _containerElement.children.length;
    if (contentCount > 1) {
        const topZIndex = getTopZIndex(_containerElement);
        _containerElement.insertAdjacentHTML("beforeend", `<div class="-split-bar" style="z-index:${topZIndex};" d-split-bar="0"></div>`.repeat(contentCount - 1));
    }

    arrangeView(_containerElement, splitObj);
}

export default {
    init,
    dispose,
    resetView,
    swap,
    $version: __VERSION__ || "unknown",
    $stamp: __STAMP__ || ""
};