const typeInstances = {
    horizontal: Object.freeze({
        s: "horizontal",
        toString() {
            return "horizontal"
        },
        isHorizontal: true,
        isVertical: false,
        minSize: "minWidth",
        maxSize: "maxWidth",
        clientSize: "clientWidth",
        size: "width",
        start: "offsetLeft",
        setStart: "left",
        beginMargin: "marginLeft",
        endMargin: "marginRight",
        eventPos: "x"
    }),
    vertical: Object.freeze({
        s: "vertical",
        toString() {
            return "vertical"
        },
        isHorizontal: false,
        isVertical: true,
        minSize: "minHeight",
        maxSize: "maxHeight",
        clientSize: "clientHeight",
        size: "height",
        start: "offsetTop",
        setStart: "top",
        beginMargin: "marginTop",
        endMargin: "marginBottom",
        eventPos: "y"
    })
};

/**
 * generate a instance as type of the splitpanel
 * @param {String} _type "vertical" or "horizontal"
 * @returns {Object} the object of the type
 */
export default function (_type) {
    return typeInstances[_type] || typeInstances.horizontal;
}