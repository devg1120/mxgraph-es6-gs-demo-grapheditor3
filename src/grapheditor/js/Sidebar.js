/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Construcs a new sidebar for the given editor.
 */

//import * as m from "../../../../dist/mxgraph.es.js";
//import * as m from "mxgraph-es6-gs";
import * as m from "@mxgraph";

import { Editor } from "./Editor.js";
import { Graph } from "./Graph.js";
import { HoverIcons } from "./Graph.js";

export class Sidebar {
  constructor(editorUi, container) {
    this.editorUi = editorUi;
    this.container = container;
    this.palettes = new Object();
    this.taglist = new Object();
    this.showTooltips = true;
    this.graph = editorUi.createTemporaryGraph(
      this.editorUi.editor.graph.getStylesheet(),
    );
    this.graph.cellRenderer.minSvgStrokeWidth = this.minThumbStrokeWidth;
    this.graph.cellRenderer.antiAlias = this.thumbAntiAlias;
    this.graph.container.style.visibility = "hidden";
    this.graph.foldingEnabled = false;

    document.body.appendChild(this.graph.container);

    this.pointerUpHandler = m.mxUtils.bind(this, function () {
      this.showTooltips = true;
    });

    m.mxEvent.addListener(
      document,
      m.mxClient.IS_POINTER ? "pointerup" : "mouseup",
      this.pointerUpHandler,
    );

    this.pointerDownHandler = m.mxUtils.bind(this, function () {
      this.showTooltips = false;
      this.hideTooltip();
    });

    m.mxEvent.addListener(
      document,
      m.mxClient.IS_POINTER ? "pointerdown" : "mousedown",
      this.pointerDownHandler,
    );

    this.pointerMoveHandler = m.mxUtils.bind(this, function (evt) {
      var src = m.mxEvent.getSource(evt);

      while (src != null) {
        if (src == this.currentElt) {
          return;
        }

        src = src.parentNode;
      }

      this.hideTooltip();
    });

    m.mxEvent.addListener(
      document,
      m.mxClient.IS_POINTER ? "pointermove" : "mousemove",
      this.pointerMoveHandler,
    );

    // Handles mouse leaving the window
    this.pointerOutHandler = m.mxUtils.bind(this, function (evt) {
      if (evt.toElement == null && evt.relatedTarget == null) {
        this.hideTooltip();
      }
    });

    m.mxEvent.addListener(
      document,
      m.mxClient.IS_POINTER ? "pointerout" : "mouseout",
      this.pointerOutHandler,
    );

    // Enables tooltips after scroll
    m.mxEvent.addListener(
      container,
      "scroll",
      m.mxUtils.bind(this, function () {
        this.showTooltips = true;
        this.hideTooltip();
      }),
    );

    this.init();
  } // constructor end
} // class end

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.init = function () {
  var dir = STENCIL_PATH;

  this.addSearchPalette(true);
  this.addGeneralPalette(true);
  this.addMiscPalette(false);
  this.addAdvancedPalette(false);
  this.addBasicPalette(dir);

  this.setCurrentSearchEntryLibrary("arrows");
  this.addStencilPalette(
    "arrows",
    m.mxResources.get("arrows"),
    dir + "/arrows.xml",
    ";whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2",
  );
  this.setCurrentSearchEntryLibrary();

  this.addUmlPalette(false);
  this.addBpmnPalette(dir, false);

  this.setCurrentSearchEntryLibrary("flowchart");
  this.addStencilPalette(
    "flowchart",
    "Flowchart",
    dir + "/flowchart.xml",
    ";whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2",
  );
  this.setCurrentSearchEntryLibrary();

  this.setCurrentSearchEntryLibrary("clipart");
  this.addImagePalette(
    "clipart",
    m.mxResources.get("clipart"),
    dir + "/clipart/",
    "_128x128.png",
    [
      "Earth_globe",
      "Empty_Folder",
      "Full_Folder",
      "Gear",
      "Lock",
      "Software",
      "Virus",
      "Email",
      "Database",
      "Router_Icon",
      "iPad",
      "iMac",
      "Laptop",
      "MacBook",
      "Monitor_Tower",
      "Printer",
      "Server_Tower",
      "Workstation",
      "Firewall_02",
      "Wireless_Router_N",
      "Credit_Card",
      "Piggy_Bank",
      "Graph",
      "Safe",
      "Shopping_Cart",
      "Suit1",
      "Suit2",
      "Suit3",
      "Pilot1",
      "Worker1",
      "Soldier1",
      "Doctor1",
      "Tech1",
      "Security1",
      "Telesales1",
    ],
    null,
    {
      Wireless_Router_N: "wireless router switch wap wifi access point wlan",
      Router_Icon: "router switch",
    },
  );
  this.setCurrentSearchEntryLibrary();
};

/**
 * Sets the default font size.
 */
Sidebar.prototype.collapsedImage = !m.mxClient.IS_SVG
  ? IMAGE_PATH + "/collapsed.gif"
  : "data:image/gif;base64,R0lGODlhDQANAIABAJmZmf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNUQyRTJFNjZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNUQyRTJFNzZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERjc3MEUxNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFERjc3MEUyNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhSMj6lrwAjcC1GyahV+dcZJgeIIFgA7";

/**
 * Sets the default font size.
 */
Sidebar.prototype.expandedImage = !m.mxClient.IS_SVG
  ? IMAGE_PATH + "/expanded.gif"
  : "data:image/gif;base64,R0lGODlhDQANAIABAJmZmf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREY3NzBERjZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREY3NzBFMDZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERjc3MERENkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFERjc3MERFNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhGMj6nL3QAjVHIu6azbvPtWAAA7";

/**
 *
 */
Sidebar.prototype.searchImage = !m.mxClient.IS_SVG
  ? IMAGE_PATH + "/search.png"
  : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEaSURBVHjabNGxS5VxFIfxz71XaWuQUJCG/gCHhgTD9VpEETg4aMOlQRp0EoezObgcd220KQiXmpretTAHQRBdojlQEJyukPdt+b1ywfvAGc7wnHP4nlZd1yKijQW8xzNc4Su+ZOYfQ3T6/f4YNvEJYzjELXp4VVXVz263+7cR2niBxAFeZ2YPi3iHR/gYERPDwhpOsd6sz8x/mfkNG3iOlWFhFj8y89J9KvzGXER0GuEaD42mgwHqUtoljbcRsTBCeINpfM/MgZLKPpaxFxGbOCqDXmILN7hoJrTKH+axhxmcYRxP0MIDnOBDZv5q1XUNIuJxifJp+UNV7t7BFM6xeic0RMQ4Bpl5W/ol7GISx/eEUUTECrbx+f8A8xhiZht9zsgAAAAASUVORK5CYII=";

/**
 *
 */
Sidebar.prototype.dragPreviewBorder = "1px dashed black";

/**
 * Specifies if tooltips should be visible. Default is true.
 */
Sidebar.prototype.enableTooltips = true;

/**
 * Specifies the delay for the tooltip. Default is 16 px.
 */
Sidebar.prototype.tooltipBorder = 16;

/**
 * Specifies the delay for the tooltip. Default is 300 ms.
 */
Sidebar.prototype.tooltipDelay = 300;

/**
 * Specifies the delay for the drop target icons. Default is 200 ms.
 */
Sidebar.prototype.dropTargetDelay = 200;

/**
 * Specifies the URL of the gear image.
 */
Sidebar.prototype.gearImage = STENCIL_PATH + "/clipart/Gear_128x128.png";

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.thumbWidth = 42;

/**
 * Specifies the height of the thumbnails.
 */
Sidebar.prototype.thumbHeight = 42;

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.minThumbStrokeWidth = 1;

/**
 * Specifies the width of the thumbnails.
 */
Sidebar.prototype.thumbAntiAlias = false;

/**
 * Specifies the padding for the thumbnails. Default is 3.
 */
Sidebar.prototype.thumbPadding = document.documentMode >= 5 ? 2 : 3;

/**
 * Specifies the delay for the tooltip. Default is 2 px.
 */
Sidebar.prototype.thumbBorder = 2;

/*
 * Experimental smaller sidebar entries
 */
if (urlParams["sidebar-entries"] != "large") {
  Sidebar.prototype.thumbPadding = document.documentMode >= 5 ? 0 : 1;
  Sidebar.prototype.thumbBorder = 1;
  Sidebar.prototype.thumbWidth = 32;
  Sidebar.prototype.thumbHeight = 30;
  Sidebar.prototype.minThumbStrokeWidth = 1.3;
  Sidebar.prototype.thumbAntiAlias = true;
}

/**
 * Specifies the size of the sidebar titles.
 */
Sidebar.prototype.sidebarTitleSize = 9;

/**
 * Specifies if titles in the sidebar should be enabled.
 */
Sidebar.prototype.sidebarTitles = false;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.tooltipTitles = true;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.maxTooltipWidth = 400;

/**
 * Specifies if titles in the tooltips should be enabled.
 */
Sidebar.prototype.maxTooltipHeight = 400;

/**
 * Specifies if stencil files should be loaded and added to the search index
 * when stencil palettes are added. If this is false then the stencil files
 * are lazy-loaded when the palette is shown.
 */
Sidebar.prototype.addStencilsToIndex = true;

/**
 * Specifies the width for clipart images. Default is 80.
 */
Sidebar.prototype.defaultImageWidth = 80;

/**
 * Specifies the height for clipart images. Default is 80.
 */
Sidebar.prototype.defaultImageHeight = 80;

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.getTooltipOffset = function () {
  return new m.mxPoint(0, 0);
};

/**
 * Adds all palettes to the sidebar.
 */
Sidebar.prototype.showTooltip = function (elt, cells, w, h, title, showLabel) {
  if (this.enableTooltips && this.showTooltips) {
    if (this.currentElt != elt) {
      if (this.thread != null) {
        window.clearTimeout(this.thread);
        this.thread = null;
      }

      var show = m.mxUtils.bind(this, function () {
        // Lazy creation of the DOM nodes and graph instance
        if (this.tooltip == null) {
          this.tooltip = document.createElement("div");
          this.tooltip.className = "geSidebarTooltip";
          this.tooltip.style.zIndex = m.mxPopupMenu.prototype.zIndex - 1;
          document.body.appendChild(this.tooltip);

          this.graph2 = new Graph(
            this.tooltip,
            null,
            null,
            this.editorUi.editor.graph.getStylesheet(),
          );
          this.graph2.resetViewOnRootChange = false;
          this.graph2.foldingEnabled = false;
          this.graph2.gridEnabled = false;
          this.graph2.autoScroll = false;
          this.graph2.setTooltips(false);
          this.graph2.setConnectable(false);
          this.graph2.setEnabled(false);

          if (!m.mxClient.IS_SVG) {
            this.graph2.view.canvas.style.position = "relative";
          }
        }

        this.graph2.model.clear();
        this.graph2.view.setTranslate(this.tooltipBorder, this.tooltipBorder);

        if (w > this.maxTooltipWidth || h > this.maxTooltipHeight) {
          this.graph2.view.scale =
            Math.round(
              Math.min(this.maxTooltipWidth / w, this.maxTooltipHeight / h) *
                100,
            ) / 100;
        } else {
          this.graph2.view.scale = 1;
        }

        this.tooltip.style.display = "block";
        this.graph2.labelsVisible = showLabel == null || showLabel;
        var fo = m.mxClient.NO_FO;
        m.mxClient.NO_FO = Editor.prototype.originalNoForeignObject;

        // Applies current style for preview
        var temp = this.graph2.cloneCells(cells);
        this.editorUi.insertHandler(temp, null, this.graph2.model);
        this.graph2.addCells(temp);

        m.mxClient.NO_FO = fo;

        var bounds = this.graph2.getGraphBounds();
        var width = bounds.width + 2 * this.tooltipBorder + 4;
        var height = bounds.height + 2 * this.tooltipBorder;

        if (m.mxClient.IS_QUIRKS) {
          height += 4;
          this.tooltip.style.overflow = "hidden";
        } else {
          this.tooltip.style.overflow = "visible";
        }

        this.tooltip.style.width = width + "px";
        var w2 = width;

        // Adds title for entry
        if (this.tooltipTitles && title != null && title.length > 0) {
          if (this.tooltipTitle == null) {
            this.tooltipTitle = document.createElement("div");
            this.tooltipTitle.style.borderTop = "1px solid gray";
            this.tooltipTitle.style.textAlign = "center";
            this.tooltipTitle.style.width = "100%";
            this.tooltipTitle.style.overflow = "hidden";
            this.tooltipTitle.style.position = "absolute";
            this.tooltipTitle.style.paddingTop = "6px";
            this.tooltipTitle.style.bottom = "6px";

            this.tooltip.appendChild(this.tooltipTitle);
          } else {
            this.tooltipTitle.innerHTML = "";
          }

          this.tooltipTitle.style.display = "";
          m.mxUtils.write(this.tooltipTitle, title);

          // Allows for wider labels
          w2 = Math.min(
            this.maxTooltipWidth,
            Math.max(width, this.tooltipTitle.scrollWidth + 4),
          );
          var ddy = this.tooltipTitle.offsetHeight + 10;
          height += ddy;

          if (m.mxClient.IS_SVG) {
            this.tooltipTitle.style.marginTop = 2 - ddy + "px";
          } else {
            height -= 6;
            this.tooltipTitle.style.top = height - ddy + "px";
          }
        } else if (
          this.tooltipTitle != null &&
          this.tooltipTitle.parentNode != null
        ) {
          this.tooltipTitle.style.display = "none";
        }

        // Updates width if label is wider
        if (w2 > width) {
          this.tooltip.style.width = w2 + "px";
        }

        this.tooltip.style.height = height + "px";
        var x0 =
          -Math.round(bounds.x - this.tooltipBorder) +
          (w2 > width ? (w2 - width) / 2 : 0);
        var y0 = -Math.round(bounds.y - this.tooltipBorder);

        var b = document.body;
        var d = document.documentElement;
        var off = this.getTooltipOffset();
        var bottom = Math.max(b.clientHeight || 0, d.clientHeight);
        var left =
          this.container.clientWidth +
          this.editorUi.splitSize +
          3 +
          this.editorUi.container.offsetLeft +
          off.x;
        var top =
          Math.min(
            bottom - height - 20 /*status bar*/,
            Math.max(
              0,
              this.editorUi.container.offsetTop +
                this.container.offsetTop +
                elt.offsetTop -
                this.container.scrollTop -
                height / 2 +
                16,
            ),
          ) + off.y;

        if (m.mxClient.IS_SVG) {
          if (x0 != 0 || y0 != 0) {
            this.graph2.view.canvas.setAttribute(
              "transform",
              "translate(" + x0 + "," + y0 + ")",
            );
          } else {
            this.graph2.view.canvas.removeAttribute("transform");
          }
        } else {
          this.graph2.view.drawPane.style.left = x0 + "px";
          this.graph2.view.drawPane.style.top = y0 + "px";
        }

        // Workaround for ignored position CSS style in IE9
        // (changes to relative without the following line)
        this.tooltip.style.position = "absolute";
        this.tooltip.style.left = left + "px";
        this.tooltip.style.top = top + "px";
      });

      if (this.tooltip != null && this.tooltip.style.display != "none") {
        show();
      } else {
        this.thread = window.setTimeout(show, this.tooltipDelay);
      }

      this.currentElt = elt;
    }
  }
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.hideTooltip = function () {
  if (this.thread != null) {
    window.clearTimeout(this.thread);
    this.thread = null;
  }

  if (this.tooltip != null) {
    this.tooltip.style.display = "none";
    this.currentElt = null;
  }
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.addDataEntry = function (tags, width, height, title, data) {
  return this.addEntry(
    tags,
    m.mxUtils.bind(this, function () {
      return this.createVertexTemplateFromData(data, width, height, title);
    }),
  );
};

/**
 * Adds the give entries to the search index.
 */
Sidebar.prototype.addEntries = function (images) {
  for (var i = 0; i < images.length; i++) {
    m.mxUtils.bind(this, function (img) {
      var data = img.data;
      var tags = img.title != null ? img.title : "";

      if (img.tags != null) {
        tags += " " + img.tags;
      }

      if (data != null && tags.length > 0) {
        this.addEntry(
          tags,
          m.mxUtils.bind(this, function () {
            data = this.editorUi.convertDataUri(data);
            var s =
              "shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;";

            if (img.aspect == "fixed") {
              s += "aspect=fixed;";
            }

            return this.createVertexTemplate(
              s + "image=" + data,
              img.w,
              img.h,
              "",
              img.title || "",
              false,
              false,
              true,
            );
          }),
        );
      } else if (img.xml != null && tags.length > 0) {
        this.addEntry(
          tags,
          m.mxUtils.bind(this, function () {
            var cells = this.editorUi.stringToCells(Graph.decompress(img.xml));

            return this.createVertexTemplateFromCells(
              cells,
              img.w,
              img.h,
              img.title || "",
              true,
              false,
              true,
            );
          }),
        );
      }
    })(images[i]);
  }
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.setCurrentSearchEntryLibrary = function (id, lib) {
  this.currentSearchEntryLibrary = id != null ? { id: id, lib: lib } : null;
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.addEntry = function (tags, fn) {
  if (this.taglist != null && tags != null && tags.length > 0) {
    if (this.currentSearchEntryLibrary != null) {
      fn.parentLibraries = [this.currentSearchEntryLibrary];
    }

    // Replaces special characters
    var tmp = tags
      .toLowerCase()
      .replace(/[\/\,\(\)]/g, " ")
      .split(" ");
    var tagList = [];
    var hash = {};

    // Finds unique tags
    for (var i = 0; i < tmp.length; i++) {
      if (hash[tmp[i]] == null) {
        hash[tmp[i]] = true;
        tagList.push(tmp[i]);
      }

      // Adds additional entry with removed trailing numbers
      var normalized = tmp[i].replace(/\.*\d*$/, "");

      if (normalized != tmp[i]) {
        if (hash[normalized] == null) {
          hash[normalized] = true;
          tagList.push(normalized);
        }
      }
    }

    for (var i = 0; i < tagList.length; i++) {
      this.addEntryForTag(tagList[i], fn);
    }
  }

  return fn;
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.addEntryForTag = function (tag, fn) {
  if (tag != null && tag.length > 1) {
    var entry = this.taglist[tag];

    if (typeof entry !== "object") {
      entry = { entries: [] };
      this.taglist[tag] = entry;
    }

    entry.entries.push(fn);
  }
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.searchEntries = function (
  searchTerms,
  count,
  page,
  success,
  error,
) {
  if (this.taglist != null && searchTerms != null) {
    var tmp = searchTerms.toLowerCase().split(" ");
    var dict = new m.mxDictionary();
    var max = (page + 1) * count;
    var results = [];
    var index = 0;

    for (var i = 0; i < tmp.length; i++) {
      if (tmp[i].length > 0) {
        var entry = this.taglist[tmp[i]];
        var tmpDict = new m.mxDictionary();

        if (entry != null) {
          var arr = entry.entries;
          results = [];

          for (var j = 0; j < arr.length; j++) {
            var entry = arr[j];

            // NOTE Array does not contain duplicates
            if ((index == 0) == (dict.get(entry) == null)) {
              tmpDict.put(entry, entry);
              results.push(entry);

              if (i == tmp.length - 1 && results.length == max) {
                success(results.slice(page * count, max), max, true, tmp);

                return;
              }
            }
          }
        } else {
          results = [];
        }

        dict = tmpDict;
        index++;
      }
    }

    var len = results.length;
    success(results.slice(page * count, (page + 1) * count), len, false, tmp);
  } else {
    success([], null, null, tmp);
  }
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.filterTags = function (tags) {
  if (tags != null) {
    var arr = tags.split(" ");
    var result = [];
    var hash = {};

    // Ignores tags with leading numbers, strips trailing numbers
    for (var i = 0; i < arr.length; i++) {
      // Removes duplicates
      if (hash[arr[i]] == null) {
        hash[arr[i]] = "1";
        result.push(arr[i]);
      }
    }

    return result.join(" ");
  }

  return null;
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.cloneCell = function (cell, value) {
  var clone = cell.clone();

  if (value != null) {
    clone.value = value;
  }

  return clone;
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.showPopupMenuForEntry = function (elt, libs, evt) {
  // Hook for subclassers
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.addSearchPalette = function (expand) {
  var elt = document.createElement("div");
  elt.style.visibility = "hidden";
  this.container.appendChild(elt);

  var div = document.createElement("div");
  div.className = "geSidebar";
  div.style.boxSizing = "border-box";
  div.style.overflow = "hidden";
  div.style.width = "100%";
  div.style.padding = "8px";
  div.style.paddingTop = "14px";
  div.style.paddingBottom = "0px";

  if (!expand) {
    div.style.display = "none";
  }

  var inner = document.createElement("div");
  inner.style.whiteSpace = "nowrap";
  inner.style.textOverflow = "clip";
  inner.style.paddingBottom = "8px";
  inner.style.cursor = "default";

  var input = document.createElement("input");
  input.setAttribute("placeholder", m.mxResources.get("searchShapes"));
  input.setAttribute("type", "text");
  input.style.fontSize = "12px";
  input.style.overflow = "hidden";
  input.style.boxSizing = "border-box";
  input.style.border = "solid 1px #d5d5d5";
  input.style.borderRadius = "4px";
  input.style.width = "100%";
  input.style.outline = "none";
  input.style.padding = "6px";
  input.style.paddingRight = "20px";
  inner.appendChild(input);

  var cross = document.createElement("img");
  cross.setAttribute("src", Sidebar.prototype.searchImage);
  cross.setAttribute("title", m.mxResources.get("search"));
  cross.style.position = "relative";
  cross.style.left = "-18px";

  if (m.mxClient.IS_QUIRKS) {
    input.style.height = "28px";
    cross.style.top = "-4px";
  } else {
    cross.style.top = "1px";
  }

  // Needed to block event transparency in IE
  cross.style.background =
    "url('" + this.editorUi.editor.transparentImage + "')";

  var find;

  inner.appendChild(cross);
  div.appendChild(inner);

  var center = document.createElement("center");
  var button = m.mxUtils.button(m.mxResources.get("moreResults"), function () {
    find();
  });
  button.style.display = "none";

  // Workaround for inherited line-height in quirks mode
  button.style.lineHeight = "normal";
  button.style.fontSize = "12px";
  button.style.padding = "6px 12px 6px 12px";
  button.style.marginTop = "4px";
  button.style.marginBottom = "8px";
  center.style.paddingTop = "4px";
  center.style.paddingBottom = "4px";

  center.appendChild(button);
  div.appendChild(center);

  var searchTerm = "";
  var active = false;
  var complete = false;
  var page = 0;
  var hash = new Object();

  // Count is dynamically updated below
  var count = 12;

  var clearDiv = m.mxUtils.bind(this, function () {
    active = false;
    this.currentSearch = null;
    var child = div.firstChild;

    while (child != null) {
      var next = child.nextSibling;

      if (child != inner && child != center) {
        child.parentNode.removeChild(child);
      }

      child = next;
    }
  });

  m.mxEvent.addListener(cross, "click", function () {
    if (cross.getAttribute("src") == Dialog.prototype.closeImage) {
      cross.setAttribute("src", Sidebar.prototype.searchImage);
      cross.setAttribute("title", m.mxResources.get("search"));
      button.style.display = "none";
      input.value = "";
      searchTerm = "";
      clearDiv();
    }

    input.focus();
  });

  find = m.mxUtils.bind(this, function () {
    // Shows 4 rows (minimum 4 results)
    count =
      4 *
      Math.max(
        1,
        Math.floor(this.container.clientWidth / (this.thumbWidth + 10)),
      );
    this.hideTooltip();

    if (input.value != "") {
      if (center.parentNode != null) {
        if (searchTerm != input.value) {
          clearDiv();
          searchTerm = input.value;
          hash = new Object();
          complete = false;
          page = 0;
        }

        if (!active && !complete) {
          button.setAttribute("disabled", "true");
          button.style.display = "";
          button.style.cursor = "wait";
          button.innerHTML = m.mxResources.get("loading") + "...";
          active = true;

          // Ignores old results
          var current = new Object();
          this.currentSearch = current;

          this.searchEntries(
            searchTerm,
            count,
            page,
            m.mxUtils.bind(this, function (results, len, more, terms) {
              if (this.currentSearch == current) {
                results = results != null ? results : [];
                active = false;
                page++;
                this.insertSearchHint(
                  div,
                  searchTerm,
                  count,
                  page,
                  results,
                  len,
                  more,
                  terms,
                );

                // Allows to repeat the search
                if (results.length == 0 && page == 1) {
                  searchTerm = "";
                }

                if (center.parentNode != null) {
                  center.parentNode.removeChild(center);
                }

                for (var i = 0; i < results.length; i++) {
                  m.mxUtils.bind(this, function (result) {
                    try {
                      var elt = result();

                      // Avoids duplicates in results
                      if (hash[elt.innerHTML] == null) {
                        hash[elt.innerHTML] =
                          result.parentLibraries != null
                            ? result.parentLibraries.slice()
                            : [];
                        div.appendChild(elt);
                      } else if (result.parentLibraries != null) {
                        hash[elt.innerHTML] = hash[elt.innerHTML].concat(
                          result.parentLibraries,
                        );
                      }

                      m.mxEvent.addGestureListeners(
                        elt,
                        null,
                        null,
                        m.mxUtils.bind(this, function (evt) {
                          var libs = hash[elt.innerHTML];

                          if (m.mxEvent.isPopupTrigger(evt)) {
                            this.showPopupMenuForEntry(elt, libs, evt);
                          }
                        }),
                      );

                      // Disables the built-in context menu
                      m.mxEvent.disableContextMenu(elt);
                    } catch (e) {
                      // ignore
                    }
                  })(results[i]);
                }

                if (more) {
                  button.removeAttribute("disabled");
                  button.innerHTML = m.mxResources.get("moreResults");
                } else {
                  button.innerHTML = m.mxResources.get("reset");
                  button.style.display = "none";
                  complete = true;
                }

                button.style.cursor = "";
                div.appendChild(center);
              }
            }),
            m.mxUtils.bind(this, function () {
              // TODO: Error handling
              button.style.cursor = "";
            }),
          );
        }
      }
    } else {
      clearDiv();
      input.value = "";
      searchTerm = "";
      hash = new Object();
      button.style.display = "none";
      complete = false;
      input.focus();
    }
  });

  m.mxEvent.addListener(
    input,
    "keydown",
    m.mxUtils.bind(this, function (evt) {
      if (evt.keyCode == 13 /* Enter */) {
        find();
        m.mxEvent.consume(evt);
      }
    }),
  );

  m.mxEvent.addListener(
    input,
    "keyup",
    m.mxUtils.bind(this, function (evt) {
      if (input.value == "") {
        cross.setAttribute("src", Sidebar.prototype.searchImage);
        cross.setAttribute("title", m.mxResources.get("search"));
      } else {
        cross.setAttribute("src", Dialog.prototype.closeImage);
        cross.setAttribute("title", m.mxResources.get("reset"));
      }

      if (input.value == "") {
        complete = true;
        button.style.display = "none";
      } else if (input.value != searchTerm) {
        button.style.display = "none";
        complete = false;
      } else if (!active) {
        if (complete) {
          button.style.display = "none";
        } else {
          button.style.display = "";
        }
      }
    }),
  );

  // Workaround for blocked text selection in Editor
  m.mxEvent.addListener(input, "mousedown", function (evt) {
    if (evt.stopPropagation) {
      evt.stopPropagation();
    }

    evt.cancelBubble = true;
  });

  // Workaround for blocked text selection in Editor
  m.mxEvent.addListener(input, "selectstart", function (evt) {
    if (evt.stopPropagation) {
      evt.stopPropagation();
    }

    evt.cancelBubble = true;
  });

  var outer = document.createElement("div");
  outer.appendChild(div);
  this.container.appendChild(outer);

  // Keeps references to the DOM nodes
  this.palettes["search"] = [elt, outer];
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.insertSearchHint = function (
  div,
  searchTerm,
  count,
  page,
  results,
  len,
  more,
  terms,
) {
  if (results.length == 0 && page == 1) {
    var err = document.createElement("div");
    err.className = "geTitle";
    err.style.cssText =
      "background-color:transparent;border-color:transparent;" +
      "color:gray;padding:6px 0px 0px 0px !important;margin:4px 8px 4px 8px;" +
      "text-align:center;cursor:default !important";

    m.mxUtils.write(err, m.mxResources.get("noResultsFor", [searchTerm]));
    div.appendChild(err);
  }
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addGeneralPalette = function (expand) {
  var lineTags =
    "line lines connector connectors connection connections arrow arrows ";
  this.setCurrentSearchEntryLibrary("general", "general");

  var fns = [
    this.createVertexTemplateEntry(
      "rounded=0;whiteSpace=wrap;html=1;",
      120,
      60,
      "",
      "Rectangle",
      null,
      null,
      "rect rectangle box",
    ),
    this.createVertexTemplateEntry(                            //GUSA GS
      //"rounded=1;whiteSpace=wrap;html=1;",
      "shape=roundedRectangle;rounded=1;whiteSpace=wrap;html=1;",
      120,
      60,
      "",
      "Rounded Rectangle",
      null,
      null,
      "rounded rect rectangle box",
    ),
    // Explicit strokecolor/fillcolor=none is a workaround to maintain transparent background regardless of current style
    this.createVertexTemplateEntry(
      "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;",
      40,
      20,
      "Text",
      "Text",
      null,
      null,
      "text textbox textarea label",
    ),
    this.createVertexTemplateEntry(
      "text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;",
      190,
      120,
      "<h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
      "Textbox",
      null,
      null,
      "text textbox textarea",
    ),
    this.createVertexTemplateEntry(
      "ellipse;whiteSpace=wrap;html=1;",
      120,
      80,
      "",
      "Ellipse",
      null,
      null,
      "oval ellipse state",
    ),
    this.createVertexTemplateEntry(
      "whiteSpace=wrap;html=1;aspect=fixed;",
      80,
      80,
      "",
      "Square",
      null,
      null,
      "square",
    ),
    this.createVertexTemplateEntry(
      "ellipse;whiteSpace=wrap;html=1;aspect=fixed;",
      80,
      80,
      "",
      "Circle",
      null,
      null,
      "circle",
    ),
    this.createVertexTemplateEntry(
      "shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;",
      120,
      60,
      "",
      "Process",
      null,
      null,
      "process task",
    ),
    this.createVertexTemplateEntry(
      "rhombus;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Diamond",
      null,
      null,
      "diamond rhombus if condition decision conditional question test",
    ),
    this.createVertexTemplateEntry(
      "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;",
      120,
      60,
      "",
      "Parallelogram",
    ),
    this.createVertexTemplateEntry(
      "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;",
      120,
      80,
      "",
      "Hexagon",
      null,
      null,
      "hexagon preparation",
    ),
    this.createVertexTemplateEntry(
      "triangle;whiteSpace=wrap;html=1;",
      60,
      80,
      "",
      "Triangle",
      null,
      null,
      "triangle logic inverter buffer",
    ),
    this.createVertexTemplateEntry(
      "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;",
      60,
      80,
      "",
      "Cylinder",
      null,
      null,
      "cylinder data database",
    ),
    this.createVertexTemplateEntry(
      "ellipse;shape=cloud;whiteSpace=wrap;html=1;",
      120,
      80,
      "",
      "Cloud",
      null,
      null,
      "cloud network",
    ),
    this.createVertexTemplateEntry(
      "shape=document;whiteSpace=wrap;html=1;boundedLbl=1;",
      120,
      80,
      "",
      "Document",
    ),
    this.createVertexTemplateEntry(
      "shape=internalStorage;whiteSpace=wrap;html=1;backgroundOutline=1;",
      80,
      80,
      "",
      "Internal Storage",
    ),
    this.createVertexTemplateEntry(
      "shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;",
      120,
      80,
      "",
      "Cube",
    ),
    this.createVertexTemplateEntry(
      "shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;",
      120,
      80,
      "",
      "Step",
    ),
    this.createVertexTemplateEntry(
      "shape=trapezoid;perimeter=trapezoidPerimeter;whiteSpace=wrap;html=1;fixedSize=1;",
      120,
      60,
      "",
      "Trapezoid",
    ),
    this.createVertexTemplateEntry(
      "shape=tape;whiteSpace=wrap;html=1;",
      120,
      100,
      "",
      "Tape",
    ),
    this.createVertexTemplateEntry(
      "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;",
      80,
      100,
      "",
      "Note",
    ),
    this.createVertexTemplateEntry(
      "shape=card;whiteSpace=wrap;html=1;",
      80,
      100,
      "",
      "Card",
    ),
    this.createVertexTemplateEntry(
      "shape=callout;whiteSpace=wrap;html=1;perimeter=calloutPerimeter;",
      120,
      80,
      "",
      "Callout",
      null,
      null,
      "bubble chat thought speech message",
    ),
    this.createVertexTemplateEntry(
      "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;",
      30,
      60,
      "Actor",
      "Actor",
      false,
      null,
      "user person human stickman",
    ),
    this.createVertexTemplateEntry(
      "shape=xor;whiteSpace=wrap;html=1;",
      60,
      80,
      "",
      "Or",
      null,
      null,
      "logic or",
    ),
    this.createVertexTemplateEntry(
      "shape=or;whiteSpace=wrap;html=1;",
      60,
      80,
      "",
      "And",
      null,
      null,
      "logic and",
    ),
    this.createVertexTemplateEntry(
      "shape=dataStorage;whiteSpace=wrap;html=1;fixedSize=1;",
      100,
      80,
      "",
      "Data Storage",
    ),
    this.addEntry(
      "curve",
      m.mxUtils.bind(this, function () {
        var cell = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 50, 50),
          "curved=1;endArrow=classic;html=1;",
        );
        cell.geometry.setTerminalPoint(new m.mxPoint(0, 50), true);
        cell.geometry.setTerminalPoint(new m.mxPoint(50, 0), false);
        cell.geometry.points = [new m.mxPoint(50, 50), new m.mxPoint(0, 0)];
        cell.geometry.relative = true;
        cell.edge = true;

        return this.createEdgeTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Curve",
        );
      }),
    ),
    this.createEdgeTemplateEntry(
      "shape=flexArrow;endArrow=classic;startArrow=classic;html=1;",
      50,
      50,
      "",
      "Bidirectional Arrow",
      null,
      lineTags + "bidirectional",
    ),
    this.createEdgeTemplateEntry(
      "shape=flexArrow;endArrow=classic;html=1;",
      50,
      50,
      "",
      "Arrow",
      null,
      lineTags + "directional directed",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=none;dashed=1;html=1;",
      50,
      50,
      "",
      "Dashed Line",
      null,
      lineTags + "dashed undirected no",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=none;dashed=1;html=1;dashPattern=1 3;strokeWidth=2;",
      50,
      50,
      "",
      "Dotted Line",
      null,
      lineTags + "dotted undirected no",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=none;html=1;",
      50,
      50,
      "",
      "Line",
      null,
      lineTags + "simple undirected plain blank no",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=classic;startArrow=classic;html=1;",
      50,
      50,
      "",
      "Bidirectional Connector",
      null,
      lineTags + "bidirectional",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=classic;html=1;",
      50,
      50,
      "",
      "Directional Connector",
      null,
      lineTags + "directional directed",
    ),
    this.createEdgeTemplateEntry(
      "shape=link;html=1;",
      100,
      0,
      "",
      "Link",
      null,
      lineTags + "link",
    ),
    this.addEntry(
      lineTags + "edge title",
      m.mxUtils.bind(this, function () {
        var edge = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 0, 0),
          "endArrow=classic;html=1;",
        );
        edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new m.mxPoint(100, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;

        var cell0 = new m.mxCell(
          "Label",
          new m.mxGeometry(0, 0, 0, 0),
          "edgeLabel;resizable=0;html=1;align=center;verticalAlign=middle;",
        );
        cell0.geometry.relative = true;
        cell0.setConnectable(false);
        cell0.vertex = true;
        edge.insert(cell0);

        return this.createEdgeTemplateFromCells(
          [edge],
          100,
          0,
          "Connector with Label",
        );
      }),
    ),
    this.addEntry(
      lineTags + "edge title multiplicity",
      m.mxUtils.bind(this, function () {
        var edge = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 0, 0),
          "endArrow=classic;html=1;",
        );
        edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new m.mxPoint(160, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;

        var cell0 = new m.mxCell(
          "Label",
          new m.mxGeometry(0, 0, 0, 0),
          "edgeLabel;resizable=0;html=1;align=center;verticalAlign=middle;",
        );
        cell0.geometry.relative = true;
        cell0.setConnectable(false);
        cell0.vertex = true;
        edge.insert(cell0);

        var cell1 = new m.mxCell(
          "Source",
          new m.mxGeometry(-1, 0, 0, 0),
          "edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;",
        );
        cell1.geometry.relative = true;
        cell1.setConnectable(false);
        cell1.vertex = true;
        edge.insert(cell1);

        return this.createEdgeTemplateFromCells(
          [edge],
          160,
          0,
          "Connector with 2 Labels",
        );
      }),
    ),
    this.addEntry(
      lineTags + "edge title multiplicity",
      m.mxUtils.bind(this, function () {
        var edge = new m.mxCell(
          "Label",
          new m.mxGeometry(0, 0, 0, 0),
          "endArrow=classic;html=1;",
        );
        edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new m.mxPoint(160, 0), false);

        edge.geometry.relative = true;
        edge.edge = true;

        var cell0 = new m.mxCell(
          "Label",
          new m.mxGeometry(0, 0, 0, 0),
          "edgeLabel;resizable=0;html=1;align=center;verticalAlign=middle;",
        );
        cell0.geometry.relative = true;
        cell0.setConnectable(false);
        cell0.vertex = true;
        edge.insert(cell0);

        var cell1 = new m.mxCell(
          "Source",
          new m.mxGeometry(-1, 0, 0, 0),
          "edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;",
        );
        cell1.geometry.relative = true;
        cell1.setConnectable(false);
        cell1.vertex = true;
        edge.insert(cell1);

        var cell2 = new m.mxCell(
          "Target",
          new m.mxGeometry(1, 0, 0, 0),
          "edgeLabel;resizable=0;html=1;align=right;verticalAlign=bottom;",
        );
        cell2.geometry.relative = true;
        cell2.setConnectable(false);
        cell2.vertex = true;
        edge.insert(cell2);

        return this.createEdgeTemplateFromCells(
          [edge],
          160,
          0,
          "Connector with 3 Labels",
        );
      }),
    ),
    this.addEntry(
      lineTags + "edge shape symbol message mail email",
      m.mxUtils.bind(this, function () {
        var edge = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 0, 0),
          "endArrow=classic;html=1;",
        );
        edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
        edge.geometry.setTerminalPoint(new m.mxPoint(100, 0), false);
        edge.geometry.relative = true;
        edge.edge = true;

        var cell = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 20, 14),
          "shape=message;html=1;outlineConnect=0;",
        );
        cell.geometry.relative = true;
        cell.vertex = true;
        cell.geometry.offset = new m.mxPoint(-10, -7);
        edge.insert(cell);

        return this.createEdgeTemplateFromCells(
          [edge],
          100,
          0,
          "Connector with Symbol",
        );
      }),
    ),
  ];

  this.addPaletteFunctions(
    "general",
    m.mxResources.get("general"),
    expand != null ? expand : true,
    fns,
  );
  this.setCurrentSearchEntryLibrary();
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addMiscPalette = function (expand) {
  var sb = this;
  var lineTags =
    "line lines connector connectors connection connections arrow arrows ";
  this.setCurrentSearchEntryLibrary("general", "misc");

  var fns = [
    this.createVertexTemplateEntry(
      "text;strokeColor=none;fillColor=none;html=1;fontSize=24;fontStyle=1;verticalAlign=middle;align=center;",
      100,
      40,
      "Title",
      "Title",
      null,
      null,
      "text heading title",
    ),
    this.createVertexTemplateEntry(
      "text;strokeColor=none;fillColor=none;html=1;whiteSpace=wrap;verticalAlign=middle;overflow=hidden;",
      100,
      80,
      "<ul><li>Value 1</li><li>Value 2</li><li>Value 3</li></ul>",
      "Unordered List",
    ),
    this.createVertexTemplateEntry(
      "text;strokeColor=none;fillColor=none;html=1;whiteSpace=wrap;verticalAlign=middle;overflow=hidden;",
      100,
      80,
      "<ol><li>Value 1</li><li>Value 2</li><li>Value 3</li></ol>",
      "Ordered List",
    ),
    this.addDataEntry(
      "table",
      180,
      120,
      "Table 1",
      "7ZjJTsMwEIafJleUhZZybVgucAFewDTT2pLjiewpaXl6xolLVQFqWBJArZRKns2xv5H7y4myvFxdW1HJWyxAR9lllOUWkdpRucpB6yiNVRFlF1GaxvyL0qsPokkTjSthwVCXgrQteBJ6Ca2ndTha6+BwUlR+SOLRu6aSSl7mRcLDWiqC+0rMfLzmTbDPkbB0r569K2Z7hoaEMmBDzQy1FpVTzWRthlS6uBFrXNLmNRtrGpYHlmD14RYbV9jfNWAJZNecUquCZMiYtBhiCWohN2WBTSxc61i81m6J8SBAex9g1h0gL5mU0HcwI2EWXVi+ZVVYrB6EXQAFR4XKENjLJ6bhgm+utM5Ro0du0PgXEVYhqGG+qX1EIiyDYQOY10kbKKMpP4wpj09G0Yh3k7OdbG1+fLqlHI0jy432c4BwVIPr3MD0aw08/YH+nfbbP2N89rZ/324NMsq5xppNqYoCTFfG2V7G454Qjw4c8WoX7wDEx0fiO3/wAyA/O+pAbzqw3m3TELIwOZQTdPZrsnB+4IiHl4UkPiIfWheS5CgMfQvDZEBhSD5xY/7fZyjZf63u7dD0fKv++5B/QRwO5ia8h3mP6sDm9tNeE9v58vcC",
    ),
    this.addDataEntry(
      "table",
      180,
      120,
      "Table 2",
      "7ZjBbqMwEIafhmuFISTptbTbS/eyrfbuBie2ZDzITEqyT79jMMlGWVTUBlqVSkTyjGeM+SbDLxPEab67t7yQPyETOojvgji1ANiM8l0qtA6iUGVBfBtEUUi/IPrRMcvq2bDgVhjskxA1CS9cb0XjaRwl7rV3lJIXboj82bluJOa0zVtGw0oqFI8FX7n5ih6CfCVyi4/qj3OFZK/AIFdGWJ+zAq15Uap6sSZCKp098D1ssb1Na7nobW4eKL/00Raqf02/f2FR7DoZ1C4P4F5ALtDuKaRSGUofsWw4hVKojWzTPLyQl41jc8g9IqWBp/p/wnF/wrRlVFz/EivkZtMH9jnMzELxxO1GoHcUoAwKe/dCNFpoa6V1ChpcTQwYdyOEwk9qsW5znwER8ha8B3NYtIaS3NBFmNLwKgkSepqUbHa06XLhFlMwJVr6J7g1BC+xEiX2LWD0tgLOLlC/2Vn9ftfDKGQXLaQxLvpYyHfXCIjpWkNFplRZJkxf2PGrsOcDsU46WV+2aT49690p5xHQzzvRx5NEf3j3j8B+8S0Rg0nE/rRMYyjGsrOVZl+0lRYfphjXnayTabEeXzFY2Ml+Pkn2Y0oGY9+aMbRmLEfUDHZ+EG+bafFFm4m9fiofrHvOD+Ut7eXEaH+AbnSfqK+nCX9A4SDz+DGxnjv51vgX",
    ),
    this.addDataEntry(
      "table title",
      180,
      120,
      "Table with Title 1",
      "7ZhRb6MwDMc/Da8nAmPdvZbu9nJ7WfcFMnAhUohR4o12n34OpKumrmqlDXa6VqJS/Lcdkp8bWSFK82Z9Z2Vb32MJOkpvozS3iDSMmnUOWkdJrMooXURJEvMvSv4c8IreG7fSgqFTEpIh4UXqZxiUR/mkYVAdbXRQXS1bP6Tem85ranitC8HDrlYEy1YW3t/xTlhzJC0t1auX0piFAg1JZcCGpAK1lq1T/WyLPqJWuvwrN/hM2/dsrfmKs5dhMT5balUZHhe8Sz/lPOwCLMH6IIleChjuABsgu+GQTpVUh4ibgVZcg6rqbVoWROkGoXrP3YHlQWD7Oed0j/NBxLxkUlI/QEHSVKfQ3odZWmwfpa2AgtCi8qhuX5iGC9pKaZ2jRl8Tg8a/iLANTg2rbe4TEmETDBvAvE/aQ8nm/DCmPP6VRRnvJmdb7Gx+fLilHI0jy/8EPwdIRx04OrWAyecF3ATEoUzH6nn1DeW8GrecxvjoXTm/XClksiuNHZu1KkswpyJPj56Z65EQZ2eOeP0R7wTEry/E+4RkOuSzS1sYuy3MJmwLN+dygmY/1hZ+nzni6duCiC/Ip+4LQlwaw9iNQYgJO4PYv2j/p4dIHL9mj3ZqRr5l//uQf6A7nM1V+AjzEdsDm7svgr3vwwfDNw==",
    ),
    this.addDataEntry(
      "table title",
      180,
      150,
      "Table with Title 2",
      "7Zhdb5swFIZ/DbcTHyVrbiFdb7Kbptq9Cw5YMj7IPi1kv37HYJK1FDWbQoOmSUSyz4dt3id+L/CitGrvNavL75Bz6UV3XpRqAOxHVZtyKb3QF7kXbbww9Onnhd8mskGX9WumucJzGsK+4YXJZ95HHtmT5H3U4EG6qClZbYfYZaOkxIrOuglo2JQC+a5mmc039CYUM8g07sRPG4p8CmSgkAnFtWvKQEpWG9GttukqSiHzLTvAMw77DLNkL1qeP0BjXLeGZkuLGde6p8V37qw2zaQoFI0zEsHumLiX5Bp5OylUF3Iq3XOoOOoDlTQix9JV3PZi+iUXRTm0xS7ITB8ojr0n3WngpH8fQzTCMEmAjoyCyQeeIVPFOTDGWuca6kemC44uUIOwUt29kBpHVYWUKUiwyBQouxFC7ZKS74feJ0CEaiDjhDku2okSJ/SQTKn/JfZiepuU5sFpTo8t15iCMqjpj2LX4Mxgww2eCzB8H+DBSewwfcQzugDOmxHO4KI8lbLVJ55/jMp/gwpI2r2EhqalyHOuztU8+vDS3MykcTzS+Ec3DP2Faz24U1+bGNpQqGLbd65mgNG+BvH7BZgLzupf8LO34JblZ6tP9LOvI5yX5bkcP1tdzc9uJ/1s4VrP52cTMK7gZ+v/fja3n60/0c8Cf8QzWvYl++s7tL6aoQXBpKMtXOz5HG2CxvyORtPTR4Uu9+qbwy8=",
    ),
    this.addDataEntry(
      "crossfunctional cross-functional cross functional flowchart swimlane table",
      400,
      400,
      "Cross-Functional Flowchart",
      "7ZhRb5swEMc/DY+bMCRt97jQpi+tVC2fwINbbMnYyD4C6aefjaHpBrTRlNCoTALJPp9t+P25O5kgTvL6XtOCPaoMRBDfBXGilULfyusEhAiikGdBfBtEUWjvIFqPjJJmNCyoBonHTIj8hB0VJXiL3dyYL+tSpsiVpM55LVSVMqrROxvci9bZMFq4JtKfzrRKGRfZA92rEjtr11tpVT1wCcYOhM5ViTKXry0G7RYb/uwWXDgDw9wCuSW2WTGOsClo6gYri8uvIGhheLN1s4KGtNSG7+AHGL+Os0JdUJm1nUJxiaDvdhZQt/EvJXHTvpTbjAq+lbadgnO1hhYSaIR6FHRjainfg8oB9d66VDxD5j0WoRcjZMC3DP8yUuMN25e5B91so5VuWMa4J+P3FJW2JtLXrOK5oNLJxZTmz/blqXhNp3mO5cpe9smS8OsyWNp5ie2TQ99ezl1joqRBTXmDAajBCgxejprHKBcNK7fvBPIz3hOSRCcQctET8olRA+8JmSopIW2j8GOD6Sji8TDxepT4C9yTE1+OEo/mQ5xcTYn8ahR5PB/k0c2UyK9HC8SbX/mnLBAnqAlD8XK+onDTE+/fw+TiQF9fTin4Nl/O0xYAEs6X9LR5n5Ae6S7xv1lr/yf+4cQ/pN75Ej/pH88/UZyQkRPzR6R+0j9Bz4f0xMm/f8adD+qzZn/bPfw5bMb++LH4Gw==",
    ),
    this.createVertexTemplateEntry(
      "text;html=1;strokeColor=#c0c0c0;fillColor=#ffffff;overflow=fill;rounded=0;",
      280,
      160,
      '<table border="1" width="100%" height="100%" cellpadding="4" style="width:100%;height:100%;border-collapse:collapse;">' +
        '<tr style="background-color:#A7C942;color:#ffffff;border:1px solid #98bf21;"><th align="left">Title 1</th><th align="left">Title 2</th><th align="left">Title 3</th></tr>' +
        '<tr style="border:1px solid #98bf21;"><td>Value 1</td><td>Value 2</td><td>Value 3</td></tr>' +
        '<tr style="background-color:#EAF2D3;border:1px solid #98bf21;"><td>Value 4</td><td>Value 5</td><td>Value 6</td></tr>' +
        '<tr style="border:1px solid #98bf21;"><td>Value 7</td><td>Value 8</td><td>Value 9</td></tr>' +
        '<tr style="background-color:#EAF2D3;border:1px solid #98bf21;"><td>Value 10</td><td>Value 11</td><td>Value 12</td></tr></table>',
      "HTML Table 1",
    ),
    this.createVertexTemplateEntry(
      "text;html=1;strokeColor=#c0c0c0;fillColor=none;overflow=fill;",
      180,
      140,
      '<table border="0" width="100%" height="100%" style="width:100%;height:100%;border-collapse:collapse;">' +
        '<tr><td align="center">Value 1</td><td align="center">Value 2</td><td align="center">Value 3</td></tr>' +
        '<tr><td align="center">Value 4</td><td align="center">Value 5</td><td align="center">Value 6</td></tr>' +
        '<tr><td align="center">Value 7</td><td align="center">Value 8</td><td align="center">Value 9</td></tr></table>',
      "HTML Table 2",
    ),
    this.createVertexTemplateEntry(
      "text;html=1;strokeColor=none;fillColor=none;overflow=fill;",
      180,
      140,
      '<table border="1" width="100%" height="100%" style="width:100%;height:100%;border-collapse:collapse;">' +
        '<tr><td align="center">Value 1</td><td align="center">Value 2</td><td align="center">Value 3</td></tr>' +
        '<tr><td align="center">Value 4</td><td align="center">Value 5</td><td align="center">Value 6</td></tr>' +
        '<tr><td align="center">Value 7</td><td align="center">Value 8</td><td align="center">Value 9</td></tr></table>',
      "HTML Table 3",
    ),
    this.createVertexTemplateEntry(
      "text;html=1;strokeColor=none;fillColor=none;overflow=fill;",
      160,
      140,
      '<table border="1" width="100%" height="100%" cellpadding="4" style="width:100%;height:100%;border-collapse:collapse;">' +
        '<tr><th align="center"><b>Title</b></th></tr>' +
        '<tr><td align="center">Section 1.1\nSection 1.2\nSection 1.3</td></tr>' +
        '<tr><td align="center">Section 2.1\nSection 2.2\nSection 2.3</td></tr></table>',
      "HTML Table 4",
    ),
    this.addEntry(
      "link hyperlink",
      m.mxUtils.bind(this, function () {
        var cell = new m.mxCell(
          "Link",
          new m.mxGeometry(0, 0, 60, 40),
          "text;html=1;strokeColor=none;fillColor=none;whiteSpace=wrap;align=center;verticalAlign=middle;fontColor=#0000EE;fontStyle=4;",
        );
        cell.vertex = true;
        this.graph.setLinkForCell(cell, "https://www.draw.io");

        return this.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Link",
        );
      }),
    ),
    this.addEntry(
      "timestamp date time text label",
      m.mxUtils.bind(this, function () {
        var cell = new m.mxCell(
          "%date{ddd mmm dd yyyy HH:MM:ss}%",
          new m.mxGeometry(0, 0, 160, 20),
          "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;overflow=hidden;",
        );
        cell.vertex = true;
        this.graph.setAttributeForCell(cell, "placeholders", "1");

        return this.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Timestamp",
        );
      }),
    ),
    this.addEntry(
      "variable placeholder metadata hello world text label",
      m.mxUtils.bind(this, function () {
        var cell = new m.mxCell(
          "%name% Text",
          new m.mxGeometry(0, 0, 80, 20),
          "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;overflow=hidden;",
        );
        cell.vertex = true;
        this.graph.setAttributeForCell(cell, "placeholders", "1");
        this.graph.setAttributeForCell(cell, "name", "Variable");

        return this.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Variable",
        );
      }),
    ),
    this.createVertexTemplateEntry(
      "shape=ext;double=1;rounded=0;whiteSpace=wrap;html=1;",
      120,
      80,
      "",
      "Double Rectangle",
      null,
      null,
      "rect rectangle box double",
    ),
    this.createVertexTemplateEntry(
      "shape=ext;double=1;rounded=1;whiteSpace=wrap;html=1;",
      120,
      80,
      "",
      "Double Rounded Rectangle",
      null,
      null,
      "rounded rect rectangle box double",
    ),
    this.createVertexTemplateEntry(
      "ellipse;shape=doubleEllipse;whiteSpace=wrap;html=1;",
      100,
      60,
      "",
      "Double Ellipse",
      null,
      null,
      "oval ellipse start end state double",
    ),
    this.createVertexTemplateEntry(
      "shape=ext;double=1;whiteSpace=wrap;html=1;aspect=fixed;",
      80,
      80,
      "",
      "Double Square",
      null,
      null,
      "double square",
    ),
    this.createVertexTemplateEntry(
      "ellipse;shape=doubleEllipse;whiteSpace=wrap;html=1;aspect=fixed;",
      80,
      80,
      "",
      "Double Circle",
      null,
      null,
      "double circle",
    ),
    this.createVertexTemplateEntry(
      "rounded=1;whiteSpace=wrap;html=1;strokeWidth=2;fillWeight=4;hachureGap=8;hachureAngle=45;fillColor=#1ba1e2;sketch=1;",
      120,
      60,
      "",
      "Rectangle Sketch",
      true,
      null,
      "rectangle rect box text sketch comic retro",
    ),
    this.createVertexTemplateEntry(
      "ellipse;whiteSpace=wrap;html=1;strokeWidth=2;fillWeight=2;hachureGap=8;fillColor=#990000;fillStyle=dots;sketch=1;",
      120,
      60,
      "",
      "Ellipse Sketch",
      true,
      null,
      "ellipse oval sketch comic retro",
    ),
    this.createVertexTemplateEntry(
      "rhombus;whiteSpace=wrap;html=1;strokeWidth=2;fillWeight=-1;hachureGap=8;fillStyle=cross-hatch;fillColor=#006600;sketch=1;",
      120,
      60,
      "",
      "Diamond Sketch",
      true,
      null,
      "diamond sketch comic retro",
    ),
    this.createVertexTemplateEntry(
      "html=1;whiteSpace=wrap;shape=isoCube2;backgroundOutline=1;isoAngle=15;",
      90,
      100,
      "",
      "Isometric Cube",
      true,
      null,
      "cube box iso isometric",
    ),
    this.createVertexTemplateEntry(
      "html=1;whiteSpace=wrap;aspect=fixed;shape=isoRectangle;",
      150,
      90,
      "",
      "Isometric Square",
      true,
      null,
      "rectangle rect box iso isometric",
    ),
    this.createEdgeTemplateEntry(
      "edgeStyle=isometricEdgeStyle;endArrow=none;html=1;",
      50,
      100,
      "",
      "Isometric Edge 1",
    ),
    this.createEdgeTemplateEntry(
      "edgeStyle=isometricEdgeStyle;endArrow=none;html=1;elbow=vertical;",
      50,
      100,
      "",
      "Isometric Edge 2",
    ),
    this.createVertexTemplateEntry(
      "shape=curlyBracket;whiteSpace=wrap;html=1;rounded=1;",
      20,
      120,
      "",
      "Curly Bracket",
    ),
    this.createVertexTemplateEntry(
      "line;strokeWidth=2;html=1;",
      160,
      10,
      "",
      "Horizontal Line",
    ),
    this.createVertexTemplateEntry(
      "line;strokeWidth=2;direction=south;html=1;",
      10,
      160,
      "",
      "Vertical Line",
    ),
    this.createVertexTemplateEntry(
      "line;strokeWidth=4;html=1;perimeter=backbonePerimeter;points=[];outlineConnect=0;",
      160,
      10,
      "",
      "Horizontal Backbone",
      false,
      null,
      "backbone bus network",
    ),
    this.createVertexTemplateEntry(
      "line;strokeWidth=4;direction=south;html=1;perimeter=backbonePerimeter;points=[];outlineConnect=0;",
      10,
      160,
      "",
      "Vertical Backbone",
      false,
      null,
      "backbone bus network",
    ),
    this.createVertexTemplateEntry(
      "shape=crossbar;whiteSpace=wrap;html=1;rounded=1;",
      120,
      20,
      "",
      "Crossbar",
      false,
      null,
      "crossbar distance measure dimension unit",
    ),
    this.createVertexTemplateEntry(
      "shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=1;aspect=fixed;image=" +
        this.gearImage,
      52,
      61,
      "",
      "Image (Fixed Aspect)",
      false,
      null,
      "fixed image icon symbol",
    ),
    this.createVertexTemplateEntry(
      "shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;image=" +
        this.gearImage,
      50,
      60,
      "",
      "Image (Variable Aspect)",
      false,
      null,
      "strechted image icon symbol",
    ),
    this.createVertexTemplateEntry(
      "icon;html=1;image=" + this.gearImage,
      60,
      60,
      "Icon",
      "Icon",
      false,
      null,
      "icon image symbol",
    ),
    this.createVertexTemplateEntry(
      "label;whiteSpace=wrap;html=1;image=" + this.gearImage,
      140,
      60,
      "Label",
      "Label 1",
      null,
      null,
      "label image icon symbol",
    ),
    this.createVertexTemplateEntry(
      "label;whiteSpace=wrap;html=1;align=center;verticalAlign=bottom;spacingLeft=0;spacingBottom=4;imageAlign=center;imageVerticalAlign=top;image=" +
        this.gearImage,
      120,
      80,
      "Label",
      "Label 2",
      null,
      null,
      "label image icon symbol",
    ),
    this.addEntry("shape group container", function () {
      var cell = new m.mxCell(
        "Label",
        new m.mxGeometry(0, 0, 160, 70),
        "html=1;whiteSpace=wrap;container=1;recursiveResize=0;collapsible=0;",
      );
      cell.vertex = true;

      var symbol = new m.mxCell(
        "",
        new m.mxGeometry(20, 20, 20, 30),
        "triangle;html=1;whiteSpace=wrap;",
      );
      symbol.vertex = true;
      cell.insert(symbol);

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Shape Group",
      );
    }),
    this.createVertexTemplateEntry(
      "shape=partialRectangle;whiteSpace=wrap;html=1;left=0;right=0;fillColor=none;",
      120,
      60,
      "",
      "Partial Rectangle",
    ),
    this.createVertexTemplateEntry(
      "shape=partialRectangle;whiteSpace=wrap;html=1;bottom=1;right=1;left=1;top=0;fillColor=none;routingCenterX=-0.5;",
      120,
      60,
      "",
      "Partial Rectangle",
    ),
    this.createEdgeTemplateEntry(
      "edgeStyle=segmentEdgeStyle;endArrow=classic;html=1;",
      50,
      50,
      "",
      "Manual Line",
      null,
      lineTags + "manual",
    ),
    this.createEdgeTemplateEntry(
      "shape=filledEdge;rounded=0;fixDash=1;endArrow=none;strokeWidth=10;fillColor=#ffffff;edgeStyle=orthogonalEdgeStyle;",
      60,
      40,
      "",
      "Filled Edge",
    ),
    this.createEdgeTemplateEntry(
      "edgeStyle=elbowEdgeStyle;elbow=horizontal;endArrow=classic;html=1;",
      50,
      50,
      "",
      "Horizontal Elbow",
      null,
      lineTags + "elbow horizontal",
    ),
    this.createEdgeTemplateEntry(
      "edgeStyle=elbowEdgeStyle;elbow=vertical;endArrow=classic;html=1;",
      50,
      50,
      "",
      "Vertical Elbow",
      null,
      lineTags + "elbow vertical",
    ),
  ];

  this.addPaletteFunctions(
    "misc",
    m.mxResources.get("misc"),
    expand != null ? expand : true,
    fns,
  );
  this.setCurrentSearchEntryLibrary();
};
/**
 * Adds the container palette to the sidebar.
 */
Sidebar.prototype.addAdvancedPalette = function (expand) {
  this.setCurrentSearchEntryLibrary("general", "advanced");
  this.addPaletteFunctions(
    "advanced",
    m.mxResources.get("advanced"),
    expand != null ? expand : false,
    this.createAdvancedShapes(),
  );
  this.setCurrentSearchEntryLibrary();
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addBasicPalette = function (dir) {
  this.setCurrentSearchEntryLibrary("basic");
  this.addStencilPalette(
    "basic",
    m.mxResources.get("basic"),
    dir + "/basic.xml",
    ";whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2",
    null,
    null,
    null,
    null,
    [
      this.createVertexTemplateEntry(
        "shape=partialRectangle;whiteSpace=wrap;html=1;top=0;bottom=0;fillColor=none;",
        120,
        60,
        "",
        "Partial Rectangle",
      ),
      this.createVertexTemplateEntry(
        "shape=partialRectangle;whiteSpace=wrap;html=1;right=0;top=0;bottom=0;fillColor=none;routingCenterX=-0.5;",
        120,
        60,
        "",
        "Partial Rectangle",
      ),
      this.createVertexTemplateEntry(
        "shape=partialRectangle;whiteSpace=wrap;html=1;bottom=0;right=0;fillColor=none;",
        120,
        60,
        "",
        "Partial Rectangle",
      ),
      this.createVertexTemplateEntry(
        "shape=partialRectangle;whiteSpace=wrap;html=1;top=0;left=0;fillColor=none;",
        120,
        60,
        "",
        "Partial Rectangle",
      ),
    ],
  );
  this.setCurrentSearchEntryLibrary();
};

/**
 * Adds the container palette to the sidebar.
 */
Sidebar.prototype.createAdvancedShapes = function () {
  // Avoids having to bind all functions to "this"
  var sb = this;

  // Reusable cells
  var field = new m.mxCell(
    "List Item",
    new m.mxGeometry(0, 0, 60, 26),
    "text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
  );
  field.vertex = true;

  return [
    this.createVertexTemplateEntry(
      "shape=tapeData;whiteSpace=wrap;html=1;perimeter=ellipsePerimeter;",
      80,
      80,
      "",
      "Tape Data",
    ),
    this.createVertexTemplateEntry(
      "shape=manualInput;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Manual Input",
    ),
    this.createVertexTemplateEntry(
      "shape=loopLimit;whiteSpace=wrap;html=1;",
      100,
      80,
      "",
      "Loop Limit",
    ),
    this.createVertexTemplateEntry(
      "shape=offPageConnector;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Off Page Connector",
    ),
    this.createVertexTemplateEntry(
      "shape=delay;whiteSpace=wrap;html=1;",
      80,
      40,
      "",
      "Delay",
    ),
    this.createVertexTemplateEntry(
      "shape=display;whiteSpace=wrap;html=1;",
      80,
      40,
      "",
      "Display",
    ),
    this.createVertexTemplateEntry(
      "shape=singleArrow;direction=west;whiteSpace=wrap;html=1;",
      100,
      60,
      "",
      "Arrow Left",
    ),
    this.createVertexTemplateEntry(
      "shape=singleArrow;whiteSpace=wrap;html=1;",
      100,
      60,
      "",
      "Arrow Right",
    ),
    this.createVertexTemplateEntry(
      "shape=singleArrow;direction=north;whiteSpace=wrap;html=1;",
      60,
      100,
      "",
      "Arrow Up",
    ),
    this.createVertexTemplateEntry(
      "shape=singleArrow;direction=south;whiteSpace=wrap;html=1;",
      60,
      100,
      "",
      "Arrow Down",
    ),
    this.createVertexTemplateEntry(
      "shape=doubleArrow;whiteSpace=wrap;html=1;",
      100,
      60,
      "",
      "Double Arrow",
    ),
    this.createVertexTemplateEntry(
      "shape=doubleArrow;direction=south;whiteSpace=wrap;html=1;",
      60,
      100,
      "",
      "Double Arrow Vertical",
      null,
      null,
      "double arrow",
    ),
    this.createVertexTemplateEntry(
      "shape=actor;whiteSpace=wrap;html=1;",
      40,
      60,
      "",
      "User",
      null,
      null,
      "user person human",
    ),
    this.createVertexTemplateEntry(
      "shape=cross;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Cross",
    ),
    this.createVertexTemplateEntry(
      "shape=corner;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Corner",
    ),
    this.createVertexTemplateEntry(
      "shape=tee;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Tee",
    ),
    this.createVertexTemplateEntry(
      "shape=datastore;whiteSpace=wrap;html=1;",
      60,
      60,
      "",
      "Data Store",
      null,
      null,
      "data store cylinder database",
    ),
    this.createVertexTemplateEntry(
      "shape=orEllipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;",
      80,
      80,
      "",
      "Or",
      null,
      null,
      "or circle oval ellipse",
    ),
    this.createVertexTemplateEntry(
      "shape=sumEllipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;",
      80,
      80,
      "",
      "Sum",
      null,
      null,
      "sum circle oval ellipse",
    ),
    this.createVertexTemplateEntry(
      "shape=lineEllipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;",
      80,
      80,
      "",
      "Ellipse with horizontal divider",
      null,
      null,
      "circle oval ellipse",
    ),
    this.createVertexTemplateEntry(
      "shape=lineEllipse;line=vertical;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;",
      80,
      80,
      "",
      "Ellipse with vertical divider",
      null,
      null,
      "circle oval ellipse",
    ),
    this.createVertexTemplateEntry(
      "shape=sortShape;perimeter=rhombusPerimeter;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Sort",
      null,
      null,
      "sort",
    ),
    this.createVertexTemplateEntry(
      "shape=collate;whiteSpace=wrap;html=1;",
      80,
      80,
      "",
      "Collate",
      null,
      null,
      "collate",
    ),
    this.createVertexTemplateEntry(
      "shape=switch;whiteSpace=wrap;html=1;",
      60,
      60,
      "",
      "Switch",
      null,
      null,
      "switch router",
    ),
    this.addEntry("process bar", function () {
      return sb.createVertexTemplateFromData(
        "zZXRaoMwFIafJpcDjbNrb2233rRQ8AkyPdPQaCRJV+3T7yTG2rUVBoOtgpDzn/xJzncCIdGyateKNeVW5iBI9EqipZLS9KOqXYIQhAY8J9GKUBrgT+jbRDZ02aBhCmrzEwPtDZ9MHKBXdkpmoDWKCVN9VptO+Kw+8kqwGqMkK7nIN6yTB7uTNizbD1FSSsVPsjYMC1qFKHxwIZZSSIVxLZ1/nJNar5+oQPMT7IYCrqUta1ENzuqGaeOFTArBGs3f3Vmtoo2Se7ja1h00kSoHK4bBIKUNy3hdoPYU0mF91i9mT8EEL2ocZ3gKa00ayWujLZY4IfHKFonVDLsRGgXuQ90zBmWgneyTk3yT1iArMKrDKUeem9L3ajHrbSXwohxsQd/ggOleKM7ese048J2/fwuim1uQGmhQCW8vQMkacP3GCQgBFMftHEsr7cYYe95CnmKTPMFbYD8CQ++DGQy+/M5X4ku5wHYmdIktfvk9tecpavThqS3m/0YtnqIWPTy1cD77K2wYjo+Ay317I74A",
        296,
        100,
        "Process Bar",
      );
    }),
    this.createVertexTemplateEntry(
      "swimlane;",
      200,
      200,
      "Container",
      "Container",
      null,
      null,
      "container swimlane lane pool group",
    ),
    this.addEntry("list group erd table", function () {
      var cell = new m.mxCell(
        "List",
        new m.mxGeometry(0, 0, 140, 110),
        "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;" +
          "resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;",
      );
      cell.vertex = true;
      cell.insert(sb.cloneCell(field, "Item 1"));
      cell.insert(sb.cloneCell(field, "Item 2"));
      cell.insert(sb.cloneCell(field, "Item 3"));

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "List",
      );
    }),
    this.addEntry("list item entry value group erd table", function () {
      return sb.createVertexTemplateFromCells(
        [sb.cloneCell(field, "List Item")],
        field.geometry.width,
        field.geometry.height,
        "List Item",
      );
    }),
  ];
};

/**
 * Adds the general palette to the sidebar.
 */
Sidebar.prototype.addUmlPalette = function (expand) {
  // Avoids having to bind all functions to "this"
  var sb = this;

  // Reusable cells
  var field = new m.mxCell(
    "+ field: type",
    new m.mxGeometry(0, 0, 100, 26),
    "text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
  );
  field.vertex = true;

  var divider = new m.mxCell(
    "",
    new m.mxGeometry(0, 0, 40, 8),
    "line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;",
  );
  divider.vertex = true;

  // Default tags
  var dt = "uml static class ";
  this.setCurrentSearchEntryLibrary("uml");

  var fns = [
    this.createVertexTemplateEntry(
      "html=1;",
      110,
      50,
      "Object",
      "Object",
      null,
      null,
      dt + "object instance",
    ),
    this.createVertexTemplateEntry(
      "html=1;",
      110,
      50,
      "&laquo;interface&raquo;<br><b>Name</b>",
      "Interface",
      null,
      null,
      dt + "interface object instance annotated annotation",
    ),
    this.addEntry(dt + "object instance", function () {
      var cell = new m.mxCell(
        "Classname",
        new m.mxGeometry(0, 0, 160, 90),
        "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;",
      );
      cell.vertex = true;
      cell.insert(field.clone());
      cell.insert(divider.clone());
      cell.insert(sb.cloneCell(field, "+ method(type): type"));

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Class",
      );
    }),
    this.addEntry(dt + "section subsection", function () {
      var cell = new m.mxCell(
        "Classname",
        new m.mxGeometry(0, 0, 140, 110),
        "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;",
      );
      cell.vertex = true;
      cell.insert(field.clone());
      cell.insert(field.clone());
      cell.insert(field.clone());

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Class 2",
      );
    }),
    this.addEntry(
      dt + "item member method function variable field attribute label",
      function () {
        return sb.createVertexTemplateFromCells(
          [sb.cloneCell(field, "+ item: attribute")],
          field.geometry.width,
          field.geometry.height,
          "Item 1",
        );
      },
    ),
    this.addEntry(
      dt + "item member method function variable field attribute label",
      function () {
        var cell = new m.mxCell(
          "item: attribute",
          new m.mxGeometry(0, 0, 120, field.geometry.height),
          "label;fontStyle=0;strokeColor=none;fillColor=none;align=left;verticalAlign=top;overflow=hidden;" +
            "spacingLeft=28;spacingRight=4;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;imageWidth=16;imageHeight=16;image=" +
            sb.gearImage,
        );
        cell.vertex = true;

        return sb.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Item 2",
        );
      },
    ),
    this.addEntry(dt + "divider hline line separator", function () {
      return sb.createVertexTemplateFromCells(
        [divider.clone()],
        divider.geometry.width,
        divider.geometry.height,
        "Divider",
      );
    }),
    this.addEntry(dt + "spacer space gap separator", function () {
      var cell = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 20, 14),
        "text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=4;spacingRight=4;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;",
      );
      cell.vertex = true;

      return sb.createVertexTemplateFromCells(
        [cell.clone()],
        cell.geometry.width,
        cell.geometry.height,
        "Spacer",
      );
    }),
    this.createVertexTemplateEntry(
      "text;align=center;fontStyle=1;verticalAlign=middle;spacingLeft=3;spacingRight=3;strokeColor=none;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      80,
      26,
      "Title",
      "Title",
      null,
      null,
      dt + "title label",
    ),
    this.addEntry(dt + "component", function () {
      var cell = new m.mxCell(
        "&laquo;Annotation&raquo;<br/><b>Component</b>",
        new m.mxGeometry(0, 0, 180, 90),
        "html=1;dropTarget=0;",
      );
      cell.vertex = true;

      var symbol = new m.mxCell(
        "",
        new m.mxGeometry(1, 0, 20, 20),
        "shape=module;jettyWidth=8;jettyHeight=4;",
      );
      symbol.vertex = true;
      symbol.geometry.relative = true;
      symbol.geometry.offset = new m.mxPoint(-27, 7);
      cell.insert(symbol);

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Component",
      );
    }),
    this.addEntry(dt + "component", function () {
      var cell = new m.mxCell(
        '<p style="margin:0px;margin-top:6px;text-align:center;"><b>Component</b></p>' +
          '<hr/><p style="margin:0px;margin-left:8px;">+ Attribute1: Type<br/>+ Attribute2: Type</p>',
        new m.mxGeometry(0, 0, 180, 90),
        "align=left;overflow=fill;html=1;dropTarget=0;",
      );
      cell.vertex = true;

      var symbol = new m.mxCell(
        "",
        new m.mxGeometry(1, 0, 20, 20),
        "shape=component;jettyWidth=8;jettyHeight=4;",
      );
      symbol.vertex = true;
      symbol.geometry.relative = true;
      symbol.geometry.offset = new m.mxPoint(-24, 4);
      cell.insert(symbol);

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Component with Attributes",
      );
    }),
    this.createVertexTemplateEntry(
      "verticalAlign=top;align=left;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;html=1;",
      180,
      120,
      "Block",
      "Block",
      null,
      null,
      dt + "block",
    ),
    this.createVertexTemplateEntry(
      "shape=module;align=left;spacingLeft=20;align=center;verticalAlign=top;",
      100,
      50,
      "Module",
      "Module",
      null,
      null,
      dt + "module component",
    ),
    this.createVertexTemplateEntry(
      "shape=folder;fontStyle=1;spacingTop=10;tabWidth=40;tabHeight=14;tabPosition=left;html=1;",
      70,
      50,
      "package",
      "Package",
      null,
      null,
      dt + "package",
    ),
    this.createVertexTemplateEntry(
      "verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;",
      160,
      90,
      '<p style="margin:0px;margin-top:4px;text-align:center;text-decoration:underline;"><b>Object:Type</b></p><hr/>' +
        '<p style="margin:0px;margin-left:8px;">field1 = value1<br/>field2 = value2<br>field3 = value3</p>',
      "Object",
      null,
      null,
      dt + "object instance",
    ),
    this.createVertexTemplateEntry(
      "verticalAlign=top;align=left;overflow=fill;html=1;",
      180,
      90,
      '<div style="box-sizing:border-box;width:100%;background:#e4e4e4;padding:2px;">Tablename</div>' +
        '<table style="width:100%;font-size:1em;" cellpadding="2" cellspacing="0">' +
        "<tr><td>PK</td><td>uniqueId</td></tr><tr><td>FK1</td><td>" +
        "foreignKey</td></tr><tr><td></td><td>fieldname</td></tr></table>",
      "Entity",
      null,
      null,
      "er entity table",
    ),
    this.addEntry(dt + "object instance", function () {
      var cell = new m.mxCell(
        '<p style="margin:0px;margin-top:4px;text-align:center;">' +
          "<b>Class</b></p>" +
          '<hr size="1"/><div style="height:2px;"></div>',
        new m.mxGeometry(0, 0, 140, 60),
        "verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;",
      );
      cell.vertex = true;

      return sb.createVertexTemplateFromCells(
        [cell.clone()],
        cell.geometry.width,
        cell.geometry.height,
        "Class 3",
      );
    }),
    this.addEntry(dt + "object instance", function () {
      var cell = new m.mxCell(
        '<p style="margin:0px;margin-top:4px;text-align:center;">' +
          "<b>Class</b></p>" +
          '<hr size="1"/><div style="height:2px;"></div><hr size="1"/><div style="height:2px;"></div>',
        new m.mxGeometry(0, 0, 140, 60),
        "verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;",
      );
      cell.vertex = true;

      return sb.createVertexTemplateFromCells(
        [cell.clone()],
        cell.geometry.width,
        cell.geometry.height,
        "Class 4",
      );
    }),
    this.addEntry(dt + "object instance", function () {
      var cell = new m.mxCell(
        '<p style="margin:0px;margin-top:4px;text-align:center;">' +
          "<b>Class</b></p>" +
          '<hr size="1"/><p style="margin:0px;margin-left:4px;">+ field: Type</p><hr size="1"/>' +
          '<p style="margin:0px;margin-left:4px;">+ method(): Type</p>',
        new m.mxGeometry(0, 0, 160, 90),
        "verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;",
      );
      cell.vertex = true;

      return sb.createVertexTemplateFromCells(
        [cell.clone()],
        cell.geometry.width,
        cell.geometry.height,
        "Class 5",
      );
    }),
    this.addEntry(dt + "object instance", function () {
      var cell = new m.mxCell(
        '<p style="margin:0px;margin-top:4px;text-align:center;">' +
          "<i>&lt;&lt;Interface&gt;&gt;</i><br/><b>Interface</b></p>" +
          '<hr size="1"/><p style="margin:0px;margin-left:4px;">+ field1: Type<br/>' +
          "+ field2: Type</p>" +
          '<hr size="1"/><p style="margin:0px;margin-left:4px;">' +
          "+ method1(Type): Type<br/>" +
          "+ method2(Type, Type): Type</p>",
        new m.mxGeometry(0, 0, 190, 140),
        "verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;",
      );
      cell.vertex = true;

      return sb.createVertexTemplateFromCells(
        [cell.clone()],
        cell.geometry.width,
        cell.geometry.height,
        "Interface 2",
      );
    }),
    this.createVertexTemplateEntry(
      "shape=providedRequiredInterface;html=1;verticalLabelPosition=bottom;",
      20,
      20,
      "",
      "Provided/Required Interface",
      null,
      null,
      "uml provided required interface lollipop notation",
    ),
    this.createVertexTemplateEntry(
      "shape=requiredInterface;html=1;verticalLabelPosition=bottom;",
      10,
      20,
      "",
      "Required Interface",
      null,
      null,
      "uml required interface lollipop notation",
    ),
    this.addEntry(
      "uml lollipop notation provided required interface",
      function () {
        return sb.createVertexTemplateFromData(
          "zVTBrptADPyavVYEkt4b0uQd3pMq5dD2uAUD27dgZJwE8vX1spsQlETtpVWRIjFjex3PmFVJWvc70m31hjlYlXxWSUqI7N/qPgVrVRyZXCUbFceR/FS8fRJdjNGo1QQN/0lB7AuO2h7AM57oeLCBIDw0Obj8SCVrJK6wxEbbV8RWyIWQP4F52Juzq9AHRqEqrm2IQpN/IsKTwAYb8MzWWBuO9B0hL2E2BGsqIQyxvJ9rzApD7QBrYBokhcBqNsf5UbrzsLzmXUu/oJET42jwGat5QYcHyiDkTDLKy03TiRrFfSx08m+FrrQtUkOZvZdbFKThmwMfVhf4fQ43/W3uZriiPPT+KKhjwnf4anKuQv//wsg+NPJ7/9d9Xf7eVykwbeeMOFWGYd/qzEVO8tHP/Suw4a2ujXV/+gXsEdhkOgSC8os44BQt0tggicZHeG1N2QiXibhAV48epRayEDd8MT7Ct06TUaXVWq027tCuhcx5VZjebeeaoDNn/WMcb/p+j0AM/dNr6InLl4Lgzylsk6OCgRWYsuI592gNZh5OhgmcblPv7+1l+ws=",
          40,
          10,
          "Lollipop Notation",
        );
      },
    ),
    this.createVertexTemplateEntry(
      "shape=umlBoundary;whiteSpace=wrap;html=1;",
      100,
      80,
      "Boundary Object",
      "Boundary Object",
      null,
      null,
      "uml boundary object",
    ),
    this.createVertexTemplateEntry(
      "ellipse;shape=umlEntity;whiteSpace=wrap;html=1;",
      80,
      80,
      "Entity Object",
      "Entity Object",
      null,
      null,
      "uml entity object",
    ),
    this.createVertexTemplateEntry(
      "ellipse;shape=umlControl;whiteSpace=wrap;html=1;",
      70,
      80,
      "Control Object",
      "Control Object",
      null,
      null,
      "uml control object",
    ),
    this.createVertexTemplateEntry(
      "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;",
      30,
      60,
      "Actor",
      "Actor",
      false,
      null,
      "uml actor",
    ),
    this.createVertexTemplateEntry(
      "ellipse;whiteSpace=wrap;html=1;",
      140,
      70,
      "Use Case",
      "Use Case",
      null,
      null,
      "uml use case usecase",
    ),
    this.addEntry("uml activity state start", function () {
      var cell = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 30, 30),
        "ellipse;html=1;shape=startState;fillColor=#000000;strokeColor=#ff0000;",
      );
      cell.vertex = true;

      var edge = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(15, 90), false);
      edge.geometry.relative = true;
      edge.edge = true;

      cell.insertEdge(edge, true);

      return sb.createVertexTemplateFromCells([cell, edge], 30, 90, "Start");
    }),
    this.addEntry("uml activity state", function () {
      var cell = new m.mxCell(
        "Activity",
        new m.mxGeometry(0, 0, 120, 40),
        "rounded=1;whiteSpace=wrap;html=1;arcSize=40;fontColor=#000000;fillColor=#ffffc0;strokeColor=#ff0000;",
      );
      cell.vertex = true;

      var edge = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(60, 100), false);
      edge.geometry.relative = true;
      edge.edge = true;

      cell.insertEdge(edge, true);

      return sb.createVertexTemplateFromCells(
        [cell, edge],
        120,
        100,
        "Activity",
      );
    }),
    this.addEntry("uml activity composite state", function () {
      var cell = new m.mxCell(
        "Composite State",
        new m.mxGeometry(0, 0, 160, 60),
        "swimlane;html=1;fontStyle=1;align=center;verticalAlign=middle;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=0;resizeLast=1;container=0;fontColor=#000000;collapsible=0;rounded=1;arcSize=30;strokeColor=#ff0000;fillColor=#ffffc0;swimlaneFillColor=#ffffc0;dropTarget=0;",
      );
      cell.vertex = true;

      var cell1 = new m.mxCell(
        "Subtitle",
        new m.mxGeometry(0, 0, 200, 26),
        "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;whiteSpace=wrap;overflow=hidden;rotatable=0;fontColor=#000000;",
      );
      cell1.vertex = true;
      cell.insert(cell1);

      var edge = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(80, 120), false);
      edge.geometry.relative = true;
      edge.edge = true;

      cell.insertEdge(edge, true);

      return sb.createVertexTemplateFromCells(
        [cell, edge],
        160,
        120,
        "Composite State",
      );
    }),
    this.addEntry("uml activity condition", function () {
      var cell = new m.mxCell(
        "Condition",
        new m.mxGeometry(0, 0, 80, 40),
        "rhombus;whiteSpace=wrap;html=1;fillColor=#ffffc0;strokeColor=#ff0000;",
      );
      cell.vertex = true;

      var edge1 = new m.mxCell(
        "no",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=orthogonalEdgeStyle;html=1;align=left;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;",
      );
      edge1.geometry.setTerminalPoint(new m.mxPoint(180, 20), false);
      edge1.geometry.relative = true;
      edge1.geometry.x = -1;
      edge1.edge = true;

      cell.insertEdge(edge1, true);

      var edge2 = new m.mxCell(
        "yes",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=orthogonalEdgeStyle;html=1;align=left;verticalAlign=top;endArrow=open;endSize=8;strokeColor=#ff0000;",
      );
      edge2.geometry.setTerminalPoint(new m.mxPoint(40, 100), false);
      edge2.geometry.relative = true;
      edge2.geometry.x = -1;
      edge2.edge = true;

      cell.insertEdge(edge2, true);

      return sb.createVertexTemplateFromCells(
        [cell, edge1, edge2],
        180,
        100,
        "Condition",
      );
    }),
    this.addEntry("uml activity fork join", function () {
      var cell = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 200, 10),
        "shape=line;html=1;strokeWidth=6;strokeColor=#ff0000;",
      );
      cell.vertex = true;

      var edge = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=orthogonalEdgeStyle;html=1;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(100, 80), false);
      edge.geometry.relative = true;
      edge.edge = true;

      cell.insertEdge(edge, true);

      return sb.createVertexTemplateFromCells(
        [cell, edge],
        200,
        80,
        "Fork/Join",
      );
    }),
    this.createVertexTemplateEntry(
      "ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#ff0000;",
      30,
      30,
      "",
      "End",
      null,
      null,
      "uml activity state end",
    ),
    this.createVertexTemplateEntry(
      "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;",
      100,
      300,
      ":Object",
      "Lifeline",
      null,
      null,
      "uml sequence participant lifeline",
    ),
    this.createVertexTemplateEntry(
      "shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;",
      20,
      300,
      "",
      "Actor Lifeline",
      null,
      null,
      "uml sequence participant lifeline actor",
    ),
    this.createVertexTemplateEntry(
      "shape=umlLifeline;participant=umlBoundary;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;",
      50,
      300,
      "",
      "Boundary Lifeline",
      null,
      null,
      "uml sequence participant lifeline boundary",
    ),
    this.createVertexTemplateEntry(
      "shape=umlLifeline;participant=umlEntity;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;",
      40,
      300,
      "",
      "Entity Lifeline",
      null,
      null,
      "uml sequence participant lifeline entity",
    ),
    this.createVertexTemplateEntry(
      "shape=umlLifeline;participant=umlControl;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;",
      40,
      300,
      "",
      "Control Lifeline",
      null,
      null,
      "uml sequence participant lifeline control",
    ),
    this.createVertexTemplateEntry(
      "shape=umlFrame;whiteSpace=wrap;html=1;",
      300,
      200,
      "frame",
      "Frame",
      null,
      null,
      "uml sequence frame",
    ),
    this.createVertexTemplateEntry(
      "shape=umlDestroy;whiteSpace=wrap;html=1;strokeWidth=3;",
      30,
      30,
      "",
      "Destruction",
      null,
      null,
      "uml sequence destruction destroy",
    ),
    this.addEntry(
      "uml sequence invoke invocation call activation",
      function () {
        var cell = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 10, 80),
          "html=1;points=[];perimeter=orthogonalPerimeter;",
        );
        cell.vertex = true;

        var edge = new m.mxCell(
          "dispatch",
          new m.mxGeometry(0, 0, 0, 0),
          "html=1;verticalAlign=bottom;startArrow=oval;endArrow=block;startSize=8;",
        );
        edge.geometry.setTerminalPoint(new m.mxPoint(-60, 0), true);
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, false);

        return sb.createVertexTemplateFromCells(
          [cell, edge],
          10,
          80,
          "Found Message",
        );
      },
    ),
    this.addEntry(
      "uml sequence invoke call delegation synchronous invocation activation",
      function () {
        var cell = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 10, 80),
          "html=1;points=[];perimeter=orthogonalPerimeter;",
        );
        cell.vertex = true;

        var edge1 = new m.mxCell(
          "dispatch",
          new m.mxGeometry(0, 0, 0, 0),
          "html=1;verticalAlign=bottom;endArrow=block;entryX=0;entryY=0;",
        );
        edge1.geometry.setTerminalPoint(new m.mxPoint(-70, 0), true);
        edge1.geometry.relative = true;
        edge1.edge = true;

        cell.insertEdge(edge1, false);

        var edge2 = new m.mxCell(
          "return",
          new m.mxGeometry(0, 0, 0, 0),
          "html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;exitX=0;exitY=0.95;",
        );
        edge2.geometry.setTerminalPoint(new m.mxPoint(-70, 76), false);
        edge2.geometry.relative = true;
        edge2.edge = true;

        cell.insertEdge(edge2, true);

        return sb.createVertexTemplateFromCells(
          [cell, edge1, edge2],
          10,
          80,
          "Synchronous Invocation",
        );
      },
    ),
    this.addEntry(
      "uml sequence self call recursion delegation activation",
      function () {
        var cell = new m.mxCell(
          "",
          new m.mxGeometry(0, 20, 10, 40),
          "html=1;points=[];perimeter=orthogonalPerimeter;",
        );
        cell.vertex = true;

        var edge = new m.mxCell(
          "self call",
          new m.mxGeometry(0, 0, 0, 0),
          "edgeStyle=orthogonalEdgeStyle;html=1;align=left;spacingLeft=2;endArrow=block;rounded=0;entryX=1;entryY=0;",
        );
        edge.geometry.setTerminalPoint(new m.mxPoint(5, 0), true);
        edge.geometry.points = [new m.mxPoint(30, 0)];
        edge.geometry.relative = true;
        edge.edge = true;

        cell.insertEdge(edge, false);

        return sb.createVertexTemplateFromCells(
          [cell, edge],
          10,
          60,
          "Self Call",
        );
      },
    ),
    this.addEntry(
      "uml sequence invoke call delegation callback activation",
      function () {
        // TODO: Check if more entries should be converted to compressed XML
        return sb.createVertexTemplateFromData(
          "xZRNT8MwDIZ/Ta6oaymD47rBTkiTuMAxW6wmIm0q19s6fj1OE3V0Y2iCA4dK8euP2I+riGxedUuUjX52CqzIHkU2R+conKpuDtaKNDFKZAuRpgl/In264J303qSRCDVdk5CGhJ20WwhKEFo62ChoqritxURkReNMTa2X80LkC68AmgoIkEWHpF3pamlXR7WIFwASdBeb7KXY4RIc5+KBQ/ZGkY4RYY5Egyl1zLqLmmyDXQ6Zx4n5EIf+HkB2BmAjrV3LzftPIPw4hgNn1pQ1a2tH5Cp2QK1miG7vNeu4iJe4pdeY2BtvbCQDGlAljMCQxBJotJ8rWCFYSWY3LvUdmZi68rvkkLiU6QnL1m1xAzHoBOdw61WEb88II9AW67/ydQ2wq1Cy1aAGvOrFfPh6997qDA3g+dxzv3nIL6MPU/8T+kMw8+m4QPgdfrEJNo8PSQj/+s58Ag==",
          10,
          60,
          "Callback",
        );
      },
    ),
    this.createVertexTemplateEntry(
      "html=1;points=[];perimeter=orthogonalPerimeter;",
      10,
      80,
      "",
      "Activation",
      null,
      null,
      "uml sequence activation",
    ),

    // new 2.5.1 shapes ******************************************************************************

    this.createVertexTemplateEntry(
      "shape=partialRectangle;html=1;top=1;align=left;dashed=1;",
      200,
      20,
      "Template1 signature",
      "Template signature",
      null,
      null,
      "template signature",
    ),
    this.createVertexTemplateEntry(
      "shape=partialRectangle;html=1;top=1;align=left;dashed=1;",
      200,
      50,
      "Template parameter 1\nTemplate parameter 2",
      "Template signature",
      null,
      null,
      "template signature",
    ),
    this.createVertexTemplateEntry(
      "shape=note2;boundedLbl=1;whiteSpace=wrap;html=1;size=25;verticalAlign=top;align=center;",
      120,
      60,
      "Comment1 body",
      "Note",
      null,
      null,
      "uml note",
    ),

    this.addEntry(
      "uml sequence self call recursion delegation activation",
      function () {
        var cell = new m.mxCell(
          "Constraint1 specification",
          new m.mxGeometry(0, 0, 160, 60),
          "shape=note2;boundedLbl=1;whiteSpace=wrap;html=1;size=25;verticalAlign=top;align=center;",
        );
        cell.vertex = true;
        var label = new m.mxCell(
          "<<keyword>>",
          new m.mxGeometry(0, 0, cell.geometry.width, 25),
          "resizeWidth=1;part=1;strokeColor=none;fillColor=none;align=left;spacingLeft=5;",
        );
        label.geometry.relative = true;
        label.vertex = true;
        cell.insert(label);

        return sb.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Note",
        );
      },
    ),

    this.addEntry(dt + "classifier", function () {
      var cell1 = new m.mxCell(
        "&lt;&lt;keyword&gt;&gt;<br><b>Classifier1</b><br>{abstract}",
        new m.mxGeometry(0, 0, 140, 183),
        "swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=55;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;",
      );
      cell1.vertex = true;
      var field1 = new m.mxCell(
        "attributes",
        new m.mxGeometry(0, 0, 140, 20),
        "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field1.vertex = true;
      cell1.insert(field1);
      var field2 = new m.mxCell(
        "attribute1",
        new m.mxGeometry(0, 0, 140, 20),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field2.vertex = true;
      cell1.insert(field2);
      var field3 = new m.mxCell(
        "inherited attribute2",
        new m.mxGeometry(0, 0, 140, 20),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#808080;",
      );
      field3.vertex = true;
      cell1.insert(field3);
      var field4 = new m.mxCell(
        "...",
        new m.mxGeometry(0, 0, 140, 20),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field4.vertex = true;
      cell1.insert(field4);
      cell1.insert(divider.clone());
      var field5 = new m.mxCell(
        "operations",
        new m.mxGeometry(0, 0, 140, 20),
        "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field5.vertex = true;
      cell1.insert(field5);
      var field6 = new m.mxCell(
        "operation1",
        new m.mxGeometry(0, 0, 140, 20),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field6.vertex = true;
      cell1.insert(field6);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Classifier",
      );
    }),

    this.createVertexTemplateEntry(
      "shape=process;fixedSize=1;size=5;fontStyle=1;",
      140,
      40,
      "Classifier1",
      "Classifier",
      null,
      null,
      "classifier",
    ),

    this.addEntry(dt + "classifier", function () {
      var cell1 = new m.mxCell(
        "Classifier1",
        new m.mxGeometry(0, 0, 140, 183),
        "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;",
      );
      cell1.vertex = true;
      var field1 = new m.mxCell(
        "internal structure",
        new m.mxGeometry(0, 0, 140, 30),
        "html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;rotatable=0;points=[[0,0.5],[1,0.5]];resizeWidth=1;",
      );
      field1.vertex = true;
      cell1.insert(field1);

      var cell2 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 140, 140),
        "strokeColor=none;fillColor=none;",
      );
      cell2.vertex = true;
      cell1.insert(cell2);

      var field2 = new m.mxCell(
        "property1",
        new m.mxGeometry(0, 0, 100, 30),
        "html=1;align=center;verticalAlign=middle;rotatable=0;",
      );
      field2.geometry.relative = true;
      field2.geometry.offset = new m.mxPoint(20, 20);
      field2.vertex = true;
      cell2.insert(field2);

      var field3 = new m.mxCell(
        "property2",
        new m.mxGeometry(0, 0, 100, 30),
        "html=1;align=center;verticalAlign=middle;rotatable=0;",
      );
      field3.geometry.relative = true;
      field3.geometry.offset = new m.mxPoint(20, 90);
      field3.vertex = true;
      cell2.insert(field3);

      var assoc1 = new m.mxCell(
        "connector1",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=none;endArrow=none;verticalAlign=middle;labelBackgroundColor=none;endSize=12;html=1;align=left;endFill=0;exitX=0.15;exitY=1;entryX=0.15;entryY=0;spacingLeft=4;",
      );
      assoc1.geometry.relative = true;
      assoc1.edge = true;
      field2.insertEdge(assoc1, true);
      field3.insertEdge(assoc1, false);
      cell2.insert(assoc1);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Classifier",
      );
    }),

    this.createVertexTemplateEntry(
      "fontStyle=1;",
      140,
      30,
      "Association1",
      "Association",
      null,
      null,
      "association",
    ),

    this.addEntry(dt + "classifier", function () {
      var cell1 = new m.mxCell(
        "Instance1",
        new m.mxGeometry(0, 0, 140, 138),
        "swimlane;fontStyle=4;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;",
      );
      cell1.vertex = true;
      var field1 = new m.mxCell(
        "slot1",
        new m.mxGeometry(0, 0, 140, 30),
        "html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;rotatable=0;points=[[0,0.5],[1,0.5]];resizeWidth=1;",
      );
      field1.vertex = true;
      cell1.insert(field1);

      cell1.insert(divider.clone());

      var field2 = new m.mxCell(
        "internal structure",
        new m.mxGeometry(0, 0, 140, 20),
        "html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;rotatable=0;points=[[0,0.5],[1,0.5]];resizeWidth=1;",
      );
      field2.vertex = true;
      cell1.insert(field2);

      var cell2 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 140, 50),
        "strokeColor=none;fillColor=none;",
      );
      cell2.vertex = true;
      cell1.insert(cell2);

      var field3 = new m.mxCell(
        "instance2",
        new m.mxGeometry(0, 0, 80, 30),
        "html=1;align=center;verticalAlign=middle;rotatable=0;",
      );
      field3.geometry.relative = true;
      field3.geometry.offset = new m.mxPoint(30, 10);
      field3.vertex = true;
      cell2.insert(field3);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Classifier",
      );
    }),

    this.createVertexTemplateEntry(
      "fontStyle=0;",
      120,
      40,
      "Instance1 value",
      "Instance",
      null,
      null,
      "instance",
    ),

    this.addEntry(dt + "classifier", function () {
      var cell1 = new m.mxCell(
        "&lt;&lt;enumeration&gt;&gt;<br><b>Enum1</b>",
        new m.mxGeometry(0, 0, 140, 70),
        "swimlane;fontStyle=0;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=40;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;",
      );
      cell1.vertex = true;
      var field1 = new m.mxCell(
        "literal1",
        new m.mxGeometry(0, 0, 140, 30),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field1.vertex = true;
      cell1.insert(field1);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Classifier",
      );
    }),

    this.addEntry(dt + "classifier", function () {
      var cell1 = new m.mxCell(
        "0..1",
        new m.mxGeometry(0, 0, 120, 50),
        "align=right;verticalAlign=top;spacingRight=2;",
      );
      cell1.vertex = true;
      var field1 = new m.mxCell(
        "Property1",
        new m.mxGeometry(0, 1, 120, 30),
        "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;resizeWidth=1;",
      );
      field1.geometry.relative = true;
      field1.geometry.offset = new m.mxPoint(0, -30);
      field1.vertex = true;

      cell1.insert(field1);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Classifier",
      );
    }),

    this.createVertexTemplateEntry(
      "fontStyle=0;dashed=1;",
      140,
      30,
      "Property1",
      "Property",
      null,
      null,
      "property",
    ),
    this.createVertexTemplateEntry(
      "fontStyle=0;labelPosition=right;verticalLabelPosition=middle;align=left;verticalAlign=middle;spacingLeft=2;",
      30,
      30,
      "port1",
      "Port",
      null,
      null,
      "port",
    ),

    this.addEntry(dt + "component", function () {
      var cell1 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 140, 200),
        "fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;marginBottom=0;",
      );
      cell1.vertex = true;

      var cell2 = new m.mxCell(
        "Component",
        new m.mxGeometry(0, 0, 140, 40),
        "html=1;align=left;spacingLeft=4;verticalAlign=top;strokeColor=none;fillColor=none;",
      );
      cell2.vertex = true;
      cell1.insert(cell2);

      var symbol = new m.mxCell(
        "",
        new m.mxGeometry(1, 0, 16, 20),
        "shape=module;jettyWidth=10;jettyHeight=4;",
      );
      symbol.vertex = true;
      symbol.geometry.relative = true;
      symbol.geometry.offset = new m.mxPoint(-25, 9);
      cell2.insert(symbol);

      cell1.insert(divider.clone());

      var cell3 = new m.mxCell(
        "provided interfaces",
        new m.mxGeometry(0, 0, 140, 25),
        "html=1;align=center;spacingLeft=4;verticalAlign=top;strokeColor=none;fillColor=none;",
      );
      cell3.vertex = true;
      cell1.insert(cell3);

      var cell4 = new m.mxCell(
        "Interface1",
        new m.mxGeometry(0, 0, 140, 25),
        "html=1;align=left;spacingLeft=4;verticalAlign=top;strokeColor=none;fillColor=none;",
      );
      cell4.vertex = true;
      cell1.insert(cell4);

      cell1.insert(divider.clone());

      var cell5 = new m.mxCell(
        "required interfaces",
        new m.mxGeometry(0, 0, 140, 25),
        "html=1;align=center;spacingLeft=4;verticalAlign=top;strokeColor=none;fillColor=none;",
      );
      cell5.vertex = true;
      cell1.insert(cell5);

      var cell6 = new m.mxCell(
        "Interface2",
        new m.mxGeometry(0, 0, 140, 30),
        "html=1;align=left;spacingLeft=4;verticalAlign=top;strokeColor=none;fillColor=none;",
      );
      cell6.vertex = true;
      cell1.insert(cell6);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Component",
      );
    }),

    this.addEntry(dt + "classifier", function () {
      var cell1 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 270, 230),
        "shape=ellipse;container=1;horizontal=1;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;html=1;dashed=1;collapsible=0;",
      );
      cell1.vertex = true;

      var field1 = new m.mxCell(
        "Collaboration1",
        new m.mxGeometry(0, 0, 270, 30),
        "html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;rotatable=0;points=[[0,0.5],[1,0.5]];resizeWidth=1;",
      );
      field1.vertex = true;
      cell1.insert(field1);

      var divider1 = new m.mxCell(
        "",
        new m.mxGeometry(0.145, 0, 192, 8),
        "line;strokeWidth=1;fillColor=none;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;dashed=1;resizeWidth=1;",
      );
      divider1.geometry.relative = true;
      divider1.geometry.offset = new m.mxPoint(0, 30);
      divider1.vertex = true;
      cell1.insert(divider1);

      var field2 = new m.mxCell(
        "Classifier1",
        new m.mxGeometry(0, 0, 100, 30),
        "html=1;align=center;verticalAlign=middle;rotatable=0;",
      );
      field2.geometry.relative = true;
      field2.geometry.offset = new m.mxPoint(85, 50);
      field2.vertex = true;
      cell1.insert(field2);

      var field3 = new m.mxCell(
        "Collaboration use 1",
        new m.mxGeometry(0, 0, 140, 30),
        "shape=ellipse;html=1;align=center;verticalAlign=middle;rotatable=0;dashed=1;",
      );
      field3.geometry.relative = true;
      field3.geometry.offset = new m.mxPoint(65, 110);
      field3.vertex = true;
      cell1.insert(field3);

      var assoc1 = new m.mxCell(
        "property1",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=none;endArrow=none;verticalAlign=middle;labelBackgroundColor=none;endSize=12;html=1;align=left;endFill=0;spacingLeft=4;",
      );
      assoc1.geometry.relative = true;
      assoc1.edge = true;
      field2.insertEdge(assoc1, true);
      field3.insertEdge(assoc1, false);
      cell1.insert(assoc1);

      var field4 = new m.mxCell(
        "Classifier2",
        new m.mxGeometry(0, 0, 100, 30),
        "html=1;align=center;verticalAlign=middle;rotatable=0;",
      );
      field4.geometry.relative = true;
      field4.geometry.offset = new m.mxPoint(85, 170);
      field4.vertex = true;
      cell1.insert(field4);

      var assoc2 = new m.mxCell(
        "property1",
        new m.mxGeometry(0, 0, 0, 0),
        "edgeStyle=none;endArrow=none;verticalAlign=middle;labelBackgroundColor=none;endSize=12;html=1;align=left;endFill=0;spacingLeft=4;",
      );
      assoc2.geometry.relative = true;
      assoc2.edge = true;
      field3.insertEdge(assoc2, true);
      field4.insertEdge(assoc2, false);
      cell1.insert(assoc2);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Classifier",
      );
    }),

    this.createVertexTemplateEntry(
      "shape=folder;fontStyle=1;tabWidth=80;tabHeight=30;tabPosition=left;html=1;boundedLbl=1;",
      150,
      80,
      "Package1",
      "Package",
      null,
      null,
      dt + "package",
    ),

    this.addEntry(dt + "package", function () {
      var cell1 = new m.mxCell(
        "Package1",
        new m.mxGeometry(0, 0, 150, 100),
        "shape=folder;fontStyle=1;tabWidth=110;tabHeight=30;tabPosition=left;html=1;boundedLbl=1;labelInHeader=1;",
      );
      cell1.vertex = true;

      var field1 = new m.mxCell(
        "Packaged element1",
        new m.mxGeometry(0, 0, 110, 30),
        "html=1;",
      );
      field1.geometry.relative = true;
      field1.geometry.offset = new m.mxPoint(20, 50);
      field1.vertex = true;
      cell1.insert(field1);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Classifier",
      );
    }),

    this.addEntry(dt + "package", function () {
      var cell1 = new m.mxCell(
        "Model1",
        new m.mxGeometry(0, 0, 150, 80),
        "shape=folder;fontStyle=1;tabWidth=110;tabHeight=30;tabPosition=left;html=1;boundedLbl=1;folderSymbol=triangle;",
      );
      cell1.vertex = true;

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Package",
      );
    }),

    this.addEntry(dt + "stereotype", function () {
      var cell1 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 160, 75),
        "shape=note2;size=25;childLayout=stackLayout;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;container=1;",
      );
      cell1.vertex = true;
      var field1 = new m.mxCell(
        "&lt;&lt;stereotype1&gt;&gt;",
        new m.mxGeometry(0, 0, 160, 25),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field1.vertex = true;
      cell1.insert(field1);
      var field2 = new m.mxCell(
        "stereotype property 1",
        new m.mxGeometry(0, 0, 160, 25),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field2.vertex = true;
      cell1.insert(field2);
      var field3 = new m.mxCell(
        "stereotype property 2",
        new m.mxGeometry(0, 0, 160, 25),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field3.vertex = true;
      cell1.insert(field3);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Stereotype",
      );
    }),

    this.addEntry(dt + "class", function () {
      var cell1 = new m.mxCell(
        "Class1",
        new m.mxGeometry(0, 0, 140, 79),
        "swimlane;fontStyle=1;align=center;verticalAlign=middle;childLayout=stackLayout;horizontal=1;startSize=29;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;",
      );
      cell1.vertex = true;
      var field1 = new m.mxCell(
        "&lt;&lt;stereotype1&gt;&gt;",
        new m.mxGeometry(0, 0, 140, 25),
        "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field1.vertex = true;
      cell1.insert(field1);
      var field2 = new m.mxCell(
        "stereotype property 1",
        new m.mxGeometry(0, 0, 140, 25),
        "text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;",
      );
      field2.vertex = true;
      cell1.insert(field2);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "Class",
      );
    }),

    this.createVertexTemplateEntry(
      "text;html=1;align=center;",
      200,
      25,
      "&lt;&lt;stereotype1, stereotype2...&gt;&gt;",
      "Label",
      null,
      null,
      dt + "label",
    ),
    this.createVertexTemplateEntry(
      "ellipse;",
      50,
      25,
      "icon",
      "Icon",
      null,
      null,
      dt + "icon",
    ),

    this.addEntry(dt + "region", function () {
      var cell1 = new m.mxCell(
        "",
        new m.mxGeometry(60, 0, 10, 100),
        "line;strokeWidth=1;direction=south;html=1;dashed=1;dashPattern=20 20;",
      );
      cell1.vertex = true;

      var cell2 = new m.mxCell(
        "Region 1",
        new m.mxGeometry(0, 40, 60, 20),
        "text;align=right;",
      );
      cell2.vertex = true;

      var cell3 = new m.mxCell(
        "Region 2",
        new m.mxGeometry(70, 40, 60, 20),
        "text;align=left;",
      );
      cell3.vertex = true;

      return sb.createVertexTemplateFromCells(
        [cell1, cell2, cell3],
        130,
        cell1.geometry.height,
        "Region",
      );
    }),

    this.addEntry(dt + "State", function () {
      var cell1 = new m.mxCell(
        "State1<br>[invariant1]<br>&lt;&lt;extended/final&gt;&gt;",
        new m.mxGeometry(0, 0, 140, 176),
        "swimlane;fontStyle=4;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=60;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;rounded=1;absoluteArcSize=1;arcSize=50;",
      );
      cell1.vertex = true;

      var field1 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 140, 50),
        "fillColor=none;strokeColor=none;container=1;collapsible=0;",
      );
      field1.vertex = true;
      cell1.insert(field1);

      var field2 = new m.mxCell(
        "State2",
        new m.mxGeometry(30, 10, 80, 30),
        "html=1;align=center;verticalAlign=middle;rounded=1;absoluteArcSize=1;arcSize=10;",
      );
      field2.vertex = true;
      field1.insert(field2);

      cell1.insert(divider.clone());

      var field3 = new m.mxCell(
        "behavior1",
        new m.mxGeometry(0, 0, 140, 25),
        "fillColor=none;strokeColor=none;align=left;verticalAlign=middle;spacingLeft=5;",
      );
      field3.vertex = true;
      cell1.insert(field3);

      cell1.insert(divider.clone());

      var field4 = new m.mxCell(
        "transition1",
        new m.mxGeometry(0, 0, 140, 25),
        "fillColor=none;strokeColor=none;align=left;verticalAlign=middle;spacingLeft=5;",
      );
      field4.vertex = true;
      cell1.insert(field4);

      return sb.createVertexTemplateFromCells(
        [cell1],
        cell1.geometry.width,
        cell1.geometry.height,
        "State",
      );
    }),

    this.createVertexTemplateEntry(
      "html=1;align=center;verticalAlign=top;rounded=1;absoluteArcSize=1;arcSize=10;dashed=1;",
      140,
      40,
      "State1",
      "State",
      null,
      null,
      dt + "state",
    ),

    this.createVertexTemplateEntry(
      "html=1;align=center;verticalAlign=top;rounded=1;absoluteArcSize=1;arcSize=10;dashed=0;",
      140,
      40,
      "State",
      "State",
      null,
      null,
      dt + "state",
    ),

    this.createVertexTemplateEntry(
      "shape=folder;align=center;verticalAlign=middle;fontStyle=0;tabWidth=100;tabHeight=30;tabPosition=left;html=1;boundedLbl=1;labelInHeader=1;rounded=1;absoluteArcSize=1;arcSize=10;",
      140,
      90,
      "State1",
      "State",
      null,
      null,
      dt + "state",
    ),

    this.createVertexTemplateEntry(
      "html=1;align=center;verticalAlign=top;rounded=1;absoluteArcSize=1;arcSize=10;dashed=0;",
      140,
      40,
      "State1, State2, ...",
      "State",
      null,
      null,
      dt + "state",
    ),

    this.createVertexTemplateEntry(
      "shape=umlState;rounded=1;verticalAlign=top;spacingTop=5;umlStateSymbol=collapseState;absoluteArcSize=1;arcSize=10;",
      140,
      60,
      "State1",
      "State",
      null,
      null,
      dt + "state",
    ),

    this.addEntry(dt + "State", function () {
      var cell1 = new m.mxCell(
        "State1",
        new m.mxGeometry(40, 0, 140, 50),
        "shape=umlState;rounded=1;verticalAlign=middle;align=center;absoluteArcSize=1;arcSize=10;umlStateConnection=connPointRefEntry;boundedLbl=1;",
      );
      cell1.vertex = true;

      var field1 = new m.mxCell(
        "Entry1",
        new m.mxGeometry(0, 40, 50, 20),
        "text;verticalAlign=middle;align=center;",
      );
      field1.vertex = true;
      cell1.insert(field1);

      return sb.createVertexTemplateFromCells(
        [cell1, field1],
        180,
        60,
        "State",
      );
    }),

    this.addEntry(dt + "State", function () {
      var cell1 = new m.mxCell(
        "State1",
        new m.mxGeometry(40, 0, 140, 50),
        "shape=umlState;rounded=1;verticalAlign=middle;spacingTop=0;absoluteArcSize=1;arcSize=10;umlStateConnection=connPointRefExit;boundedLbl=1;",
      );
      cell1.vertex = true;

      var field1 = new m.mxCell(
        "Exit1",
        new m.mxGeometry(0, 40, 50, 20),
        "text;verticalAlign=middle;align=center;",
      );
      field1.vertex = true;
      cell1.insert(field1);

      return sb.createVertexTemplateFromCells(
        [cell1, field1],
        180,
        60,
        "State",
      );
    }),

    this.createVertexTemplateEntry(
      "ellipse;fillColor=#000000;strokeColor=none;",
      30,
      30,
      "",
      "Initial state",
      null,
      null,
      dt + "initial state",
    ),

    this.createVertexTemplateEntry(
      "ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;",
      30,
      30,
      "",
      "Final state",
      null,
      null,
      dt + "final state",
    ),

    this.createVertexTemplateEntry(
      "ellipse;fillColor=#ffffff;strokeColor=#000000;",
      30,
      30,
      "H",
      "Shallow History",
      null,
      null,
      dt + "shallow history",
    ),

    this.createVertexTemplateEntry(
      "ellipse;fillColor=#ffffff;strokeColor=#000000;",
      30,
      30,
      "H*",
      "Deep History",
      null,
      null,
      dt + "deep history",
    ),

    this.createVertexTemplateEntry(
      "ellipse;fillColor=#ffffff;strokeColor=#000000;",
      30,
      30,
      "",
      "Entry Point",
      null,
      null,
      dt + "entry point",
    ),

    this.createVertexTemplateEntry(
      "shape=sumEllipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;backgroundOutline=1;",
      30,
      30,
      "",
      "Exit Point",
      null,
      null,
      dt + "exit point",
    ),

    this.createVertexTemplateEntry(
      "ellipse;fillColor=#000000;strokeColor=none;",
      20,
      20,
      "",
      "Junction",
      null,
      null,
      dt + "junction",
    ),

    this.createVertexTemplateEntry(
      "rhombus;",
      30,
      30,
      "",
      "Choice",
      null,
      null,
      dt + "choice",
    ),

    this.createVertexTemplateEntry(
      "shape=umlDestroy;",
      30,
      30,
      "",
      "Terminate",
      null,
      null,
      dt + "terminate",
    ),

    this.createVertexTemplateEntry(
      "html=1;points=[];perimeter=orthogonalPerimeter;fillColor=#000000;strokeColor=none;",
      5,
      80,
      "",
      "Join/Fork",
      null,
      null,
      dt + "join fork",
    ),

    this.createVertexTemplateEntry(
      "text;align=center;verticalAlign=middle;dashed=0;fillColor=#ffffff;strokeColor=#000000;",
      140,
      40,
      "OpaqueAction1 spec.",
      "Opaque Action",
      null,
      null,
      dt + "opaque action",
    ),

    // end of new shapes ******************************************************************************

    this.createEdgeTemplateEntry(
      "html=1;verticalAlign=bottom;startArrow=oval;startFill=1;endArrow=block;startSize=8;",
      60,
      0,
      "dispatch",
      "Found Message 1",
      null,
      "uml sequence message call invoke dispatch",
    ),
    this.createEdgeTemplateEntry(
      "html=1;verticalAlign=bottom;startArrow=circle;startFill=1;endArrow=open;startSize=6;endSize=8;",
      80,
      0,
      "dispatch",
      "Found Message 2",
      null,
      "uml sequence message call invoke dispatch",
    ),
    this.createEdgeTemplateEntry(
      "html=1;verticalAlign=bottom;endArrow=block;",
      80,
      0,
      "dispatch",
      "Message",
      null,
      "uml sequence message call invoke dispatch",
    ),
    this.addEntry("uml sequence return message", function () {
      var edge = new m.mxCell(
        "return",
        new m.mxGeometry(0, 0, 0, 0),
        "html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(80, 0), true);
      edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), false);
      edge.geometry.relative = true;
      edge.edge = true;

      return sb.createEdgeTemplateFromCells([edge], 80, 0, "Return");
    }),
    this.addEntry("uml relation", function () {
      var edge = new m.mxCell(
        "name",
        new m.mxGeometry(0, 0, 0, 0),
        "endArrow=block;endFill=1;html=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=top;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
      edge.geometry.setTerminalPoint(new m.mxPoint(160, 0), false);
      edge.geometry.relative = true;
      edge.geometry.x = -1;
      edge.edge = true;

      var cell = new m.mxCell(
        "1",
        new m.mxGeometry(-1, 0, 0, 0),
        "edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;",
      );
      cell.geometry.relative = true;
      cell.setConnectable(false);
      cell.vertex = true;
      edge.insert(cell);

      return sb.createEdgeTemplateFromCells([edge], 160, 0, "Relation 1");
    }),
    this.addEntry("uml association", function () {
      var edge = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 0, 0),
        "endArrow=none;html=1;edgeStyle=orthogonalEdgeStyle;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
      edge.geometry.setTerminalPoint(new m.mxPoint(160, 0), false);
      edge.geometry.relative = true;
      edge.edge = true;

      var cell1 = new m.mxCell(
        "parent",
        new m.mxGeometry(-1, 0, 0, 0),
        "edgeLabel;resizable=0;html=1;align=left;verticalAlign=bottom;",
      );
      cell1.geometry.relative = true;
      cell1.setConnectable(false);
      cell1.vertex = true;
      edge.insert(cell1);

      var cell2 = new m.mxCell(
        "child",
        new m.mxGeometry(1, 0, 0, 0),
        "edgeLabel;resizable=0;html=1;align=right;verticalAlign=bottom;",
      );
      cell2.geometry.relative = true;
      cell2.setConnectable(false);
      cell2.vertex = true;
      edge.insert(cell2);

      return sb.createEdgeTemplateFromCells([edge], 160, 0, "Association 1");
    }),
    this.addEntry("uml aggregation", function () {
      var edge = new m.mxCell(
        "1",
        new m.mxGeometry(0, 0, 0, 0),
        "endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
      edge.geometry.setTerminalPoint(new m.mxPoint(160, 0), false);
      edge.geometry.relative = true;
      edge.geometry.x = -1;
      edge.geometry.y = 3;
      edge.edge = true;

      return sb.createEdgeTemplateFromCells([edge], 160, 0, "Aggregation 1");
    }),
    this.addEntry("uml composition", function () {
      var edge = new m.mxCell(
        "1",
        new m.mxGeometry(0, 0, 0, 0),
        "endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
      edge.geometry.setTerminalPoint(new m.mxPoint(160, 0), false);
      edge.geometry.relative = true;
      edge.geometry.x = -1;
      edge.geometry.y = 3;
      edge.edge = true;

      return sb.createEdgeTemplateFromCells([edge], 160, 0, "Composition 1");
    }),
    this.addEntry("uml relation", function () {
      var edge = new m.mxCell(
        "Relation",
        new m.mxGeometry(0, 0, 0, 0),
        "endArrow=open;html=1;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
      edge.geometry.setTerminalPoint(new m.mxPoint(160, 0), false);
      edge.geometry.relative = true;
      edge.edge = true;

      var cell1 = new m.mxCell(
        "0..n",
        new m.mxGeometry(-1, 0, 0, 0),
        "edgeLabel;resizable=0;html=1;align=left;verticalAlign=top;",
      );
      cell1.geometry.relative = true;
      cell1.setConnectable(false);
      cell1.vertex = true;
      edge.insert(cell1);

      var cell2 = new m.mxCell(
        "1",
        new m.mxGeometry(1, 0, 0, 0),
        "edgeLabel;resizable=0;html=1;align=right;verticalAlign=top;",
      );
      cell2.geometry.relative = true;
      cell2.setConnectable(false);
      cell2.vertex = true;
      edge.insert(cell2);

      return sb.createEdgeTemplateFromCells([edge], 160, 0, "Relation 2");
    }),
    this.createEdgeTemplateEntry(
      "endArrow=open;endSize=12;dashed=1;html=1;",
      160,
      0,
      "Use",
      "Dependency",
      null,
      "uml dependency use",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=block;endSize=16;endFill=0;html=1;",
      160,
      0,
      "Extends",
      "Generalization",
      null,
      "uml generalization extend",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=block;startArrow=block;endFill=1;startFill=1;html=1;",
      160,
      0,
      "",
      "Association 2",
      null,
      "uml association",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=open;startArrow=circlePlus;endFill=0;startFill=0;endSize=8;html=1;",
      160,
      0,
      "",
      "Inner Class",
      null,
      "uml inner class",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=open;startArrow=cross;endFill=0;startFill=0;endSize=8;startSize=10;html=1;",
      160,
      0,
      "",
      "Terminate",
      null,
      "uml terminate",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=block;dashed=1;endFill=0;endSize=12;html=1;",
      160,
      0,
      "",
      "Implementation",
      null,
      "uml realization implementation",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=diamondThin;endFill=0;endSize=24;html=1;",
      160,
      0,
      "",
      "Aggregation 2",
      null,
      "uml aggregation",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=diamondThin;endFill=1;endSize=24;html=1;",
      160,
      0,
      "",
      "Composition 2",
      null,
      "uml composition",
    ),
    this.createEdgeTemplateEntry(
      "endArrow=open;endFill=1;endSize=12;html=1;",
      160,
      0,
      "",
      "Association 3",
      null,
      "uml association",
    ),
  ];

  this.addPaletteFunctions(
    "uml",
    m.mxResources.get("uml"),
    expand || false,
    fns,
  );
  this.setCurrentSearchEntryLibrary();
};

/**
 * Adds the BPMN library to the sidebar.
 */
Sidebar.prototype.addBpmnPalette = function (dir, expand) {
  // Avoids having to bind all functions to "this"
  var sb = this;
  this.setCurrentSearchEntryLibrary("bpmn");

  var fns = [
    this.createVertexTemplateEntry(
      "shape=ext;rounded=1;html=1;whiteSpace=wrap;",
      120,
      80,
      "Task",
      "Process",
      null,
      null,
      "bpmn task process",
    ),
    this.createVertexTemplateEntry(
      "shape=ext;rounded=1;html=1;whiteSpace=wrap;double=1;",
      120,
      80,
      "Transaction",
      "Transaction",
      null,
      null,
      "bpmn transaction",
    ),
    this.createVertexTemplateEntry(
      "shape=ext;rounded=1;html=1;whiteSpace=wrap;dashed=1;dashPattern=1 4;",
      120,
      80,
      "Event\nSub-Process",
      "Event Sub-Process",
      null,
      null,
      "bpmn event subprocess sub process sub-process",
    ),
    this.createVertexTemplateEntry(
      "shape=ext;rounded=1;html=1;whiteSpace=wrap;strokeWidth=3;",
      120,
      80,
      "Call Activity",
      "Call Activity",
      null,
      null,
      "bpmn call activity",
    ),
    this.addEntry("bpmn subprocess sub process sub-process", function () {
      var cell = new m.mxCell(
        "Sub-Process",
        new m.mxGeometry(0, 0, 120, 80),
        "html=1;whiteSpace=wrap;rounded=1;dropTarget=0;",
      );
      cell.vertex = true;

      var cell1 = new m.mxCell(
        "",
        new m.mxGeometry(0.5, 1, 14, 14),
        "html=1;shape=plus;outlineConnect=0;",
      );
      cell1.vertex = true;
      cell1.geometry.relative = true;
      cell1.geometry.offset = new m.mxPoint(-7, -14);
      cell.insert(cell1);

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Sub-Process",
      );
    }),
    this.addEntry(
      this.getTagsForStencil(
        "mxgraph.bpmn",
        "loop",
        "subprocess sub process sub-process looped",
      ).join(" "),
      function () {
        var cell = new m.mxCell(
          "Looped\nSub-Process",
          new m.mxGeometry(0, 0, 120, 80),
          "html=1;whiteSpace=wrap;rounded=1;dropTarget=0;",
        );
        cell.vertex = true;

        var cell1 = new m.mxCell(
          "",
          new m.mxGeometry(0.5, 1, 14, 14),
          "html=1;shape=mxgraph.bpmn.loop;outlineConnect=0;",
        );
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new m.mxPoint(-15, -14);
        cell.insert(cell1);

        var cell2 = new m.mxCell(
          "",
          new m.mxGeometry(0.5, 1, 14, 14),
          "html=1;shape=plus;",
        );
        cell2.vertex = true;
        cell2.geometry.relative = true;
        cell2.geometry.offset = new m.mxPoint(1, -14);
        cell.insert(cell2);

        return sb.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Looped Sub-Process",
        );
      },
    ),
    this.addEntry("bpmn receive task", function () {
      var cell = new m.mxCell(
        "Receive",
        new m.mxGeometry(0, 0, 120, 80),
        "html=1;whiteSpace=wrap;rounded=1;dropTarget=0;",
      );
      cell.vertex = true;

      var cell1 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 20, 14),
        "html=1;shape=message;outlineConnect=0;",
      );
      cell1.vertex = true;
      cell1.geometry.relative = true;
      cell1.geometry.offset = new m.mxPoint(7, 7);
      cell.insert(cell1);

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Receive Task",
      );
    }),
    this.addEntry(
      this.getTagsForStencil("mxgraph.bpmn", "user_task").join(" "),
      function () {
        var cell = new m.mxCell(
          "User",
          new m.mxGeometry(0, 0, 120, 80),
          "html=1;whiteSpace=wrap;rounded=1;dropTarget=0;",
        );
        cell.vertex = true;

        var cell1 = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 14, 14),
          "html=1;shape=mxgraph.bpmn.user_task;outlineConnect=0;",
        );
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new m.mxPoint(7, 7);
        cell.insert(cell1);

        var cell2 = new m.mxCell(
          "",
          new m.mxGeometry(0.5, 1, 14, 14),
          "html=1;shape=plus;outlineConnect=0;",
        );
        cell2.vertex = true;
        cell2.geometry.relative = true;
        cell2.geometry.offset = new m.mxPoint(-7, -14);
        cell.insert(cell2);

        return sb.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "User Task",
        );
      },
    ),
    this.addEntry(
      this.getTagsForStencil("mxgraph.bpmn", "timer_start", "attached").join(
        " ",
      ),
      function () {
        var cell = new m.mxCell(
          "Process",
          new m.mxGeometry(0, 0, 120, 80),
          "html=1;whiteSpace=wrap;rounded=1;dropTarget=0;",
        );
        cell.vertex = true;

        var cell1 = new m.mxCell(
          "",
          new m.mxGeometry(1, 1, 30, 30),
          "shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=1;verticalLabelPosition=bottom;verticalAlign=top;outlineConnect=0;",
        );
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new m.mxPoint(-40, -15);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells(
          [cell],
          120,
          95,
          "Attached Timer Event 1",
        );
      },
    ),
    this.addEntry(
      this.getTagsForStencil("mxgraph.bpmn", "timer_start", "attached").join(
        " ",
      ),
      function () {
        var cell = new m.mxCell(
          "Process",
          new m.mxGeometry(0, 0, 120, 80),
          "html=1;whiteSpace=wrap;rounded=1;dropTarget=0;",
        );
        cell.vertex = true;

        var cell1 = new m.mxCell(
          "",
          new m.mxGeometry(1, 0, 30, 30),
          "shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=1;labelPosition=right;align=left;outlineConnect=0;",
        );
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new m.mxPoint(-15, 10);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells(
          [cell],
          135,
          80,
          "Attached Timer Event 2",
        );
      },
    ),
    this.createVertexTemplateEntry(
      "swimlane;html=1;horizontal=0;startSize=20;",
      320,
      240,
      "Pool",
      "Pool",
      null,
      null,
      "bpmn pool",
    ),
    this.createVertexTemplateEntry(
      "swimlane;html=1;horizontal=0;swimlaneLine=0;",
      300,
      120,
      "Lane",
      "Lane",
      null,
      null,
      "bpmn lane",
    ),
    this.createVertexTemplateEntry(
      "shape=hexagon;html=1;whiteSpace=wrap;perimeter=hexagonPerimeter;rounded=0;",
      60,
      50,
      "",
      "Conversation",
      null,
      null,
      "bpmn conversation",
    ),
    this.createVertexTemplateEntry(
      "shape=hexagon;html=1;whiteSpace=wrap;perimeter=hexagonPerimeter;strokeWidth=4;rounded=0;",
      60,
      50,
      "",
      "Call Conversation",
      null,
      null,
      "bpmn call conversation",
    ),
    this.addEntry(
      "bpmn subconversation sub conversation sub-conversation",
      function () {
        var cell = new m.mxCell(
          "",
          new m.mxGeometry(0, 0, 60, 50),
          "shape=hexagon;whiteSpace=wrap;html=1;perimeter=hexagonPerimeter;rounded=0;dropTarget=0;",
        );
        cell.vertex = true;

        var cell1 = new m.mxCell(
          "",
          new m.mxGeometry(0.5, 1, 14, 14),
          "html=1;shape=plus;",
        );
        cell1.vertex = true;
        cell1.geometry.relative = true;
        cell1.geometry.offset = new m.mxPoint(-7, -14);
        cell.insert(cell1);

        return sb.createVertexTemplateFromCells(
          [cell],
          cell.geometry.width,
          cell.geometry.height,
          "Sub-Conversation",
        );
      },
    ),
    this.addEntry("bpmn data object", function () {
      var cell = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 40, 60),
        "shape=note;whiteSpace=wrap;size=16;html=1;dropTarget=0;",
      );
      cell.vertex = true;

      var cell1 = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 14, 14),
        "html=1;shape=singleArrow;arrowWidth=0.4;arrowSize=0.4;outlineConnect=0;",
      );
      cell1.vertex = true;
      cell1.geometry.relative = true;
      cell1.geometry.offset = new m.mxPoint(2, 2);
      cell.insert(cell1);

      var cell2 = new m.mxCell(
        "",
        new m.mxGeometry(0.5, 1, 14, 14),
        "html=1;whiteSpace=wrap;shape=parallelMarker;outlineConnect=0;",
      );
      cell2.vertex = true;
      cell2.geometry.relative = true;
      cell2.geometry.offset = new m.mxPoint(-7, -14);
      cell.insert(cell2);

      return sb.createVertexTemplateFromCells(
        [cell],
        cell.geometry.width,
        cell.geometry.height,
        "Data Object",
      );
    }),
    this.createVertexTemplateEntry(
      "shape=datastore;whiteSpace=wrap;html=1;",
      60,
      60,
      "",
      "Data Store",
      null,
      null,
      "bpmn data store",
    ),
    this.createVertexTemplateEntry(
      "shape=plus;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Sub-Process Marker",
      null,
      null,
      "bpmn subprocess sub process sub-process marker",
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.loop;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Loop Marker",
      null,
      null,
      "bpmn loop marker",
    ),
    this.createVertexTemplateEntry(
      "shape=parallelMarker;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Parallel MI Marker",
      null,
      null,
      "bpmn parallel mi marker",
    ),
    this.createVertexTemplateEntry(
      "shape=parallelMarker;direction=south;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Sequential MI Marker",
      null,
      null,
      "bpmn sequential mi marker",
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.ad_hoc;fillColor=#000000;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Ad Hoc Marker",
      null,
      null,
      "bpmn ad hoc marker",
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.compensation;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Compensation Marker",
      null,
      null,
      "bpmn compensation marker",
    ),
    this.createVertexTemplateEntry(
      "shape=message;whiteSpace=wrap;html=1;outlineConnect=0;fillColor=#000000;strokeColor=#ffffff;strokeWidth=2;",
      40,
      30,
      "",
      "Send Task",
      null,
      null,
      "bpmn send task",
    ),
    this.createVertexTemplateEntry(
      "shape=message;whiteSpace=wrap;html=1;outlineConnect=0;",
      40,
      30,
      "",
      "Receive Task",
      null,
      null,
      "bpmn receive task",
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.user_task;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "User Task",
      null,
      null,
      this.getTagsForStencil("mxgraph.bpmn", "user_task").join(" "),
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.manual_task;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Manual Task",
      null,
      null,
      this.getTagsForStencil("mxgraph.bpmn", "user_task").join(" "),
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.business_rule_task;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Business Rule Task",
      null,
      null,
      this.getTagsForStencil("mxgraph.bpmn", "business_rule_task").join(" "),
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.service_task;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Service Task",
      null,
      null,
      this.getTagsForStencil("mxgraph.bpmn", "service_task").join(" "),
    ),
    this.createVertexTemplateEntry(
      "shape=mxgraph.bpmn.script_task;html=1;outlineConnect=0;",
      14,
      14,
      "",
      "Script Task",
      null,
      null,
      this.getTagsForStencil("mxgraph.bpmn", "script_task").join(" "),
    ),
    this.createVertexTemplateEntry(
      "html=1;shape=mxgraph.flowchart.annotation_2;align=left;labelPosition=right;",
      50,
      100,
      "",
      "Annotation",
      null,
      null,
      this.getTagsForStencil(
        "bpmn",
        "annotation_1",
        "bpmn business process model ",
      ).join(" "),
    ),
    this.addDataEntry(
      "crossfunctional cross-functional cross functional flowchart swimlane table",
      400,
      400,
      "Cross-Functional Flowchart",
      "7ZhRb5swEMc/DY+bMCRt97jQpi+tVC2fwINbbMnYyD4C6aefjaHpBrTRlNCoTALJPp9t+P25O5kgTvL6XtOCPaoMRBDfBXGilULfyusEhAiikGdBfBtEUWjvIFqPjJJmNCyoBonHTIj8hB0VJXiL3dyYL+tSpsiVpM55LVSVMqrROxvci9bZMFq4JtKfzrRKGRfZA92rEjtr11tpVT1wCcYOhM5ViTKXry0G7RYb/uwWXDgDw9wCuSW2WTGOsClo6gYri8uvIGhheLN1s4KGtNSG7+AHGL+Os0JdUJm1nUJxiaDvdhZQt/EvJXHTvpTbjAq+lbadgnO1hhYSaIR6FHRjainfg8oB9d66VDxD5j0WoRcjZMC3DP8yUuMN25e5B91so5VuWMa4J+P3FJW2JtLXrOK5oNLJxZTmz/blqXhNp3mO5cpe9smS8OsyWNp5ie2TQ99ezl1joqRBTXmDAajBCgxejprHKBcNK7fvBPIz3hOSRCcQctET8olRA+8JmSopIW2j8GOD6Sji8TDxepT4C9yTE1+OEo/mQ5xcTYn8ahR5PB/k0c2UyK9HC8SbX/mnLBAnqAlD8XK+onDTE+/fw+TiQF9fTin4Nl/O0xYAEs6X9LR5n5Ae6S7xv1lr/yf+4cQ/pN75Ej/pH88/UZyQkRPzR6R+0j9Bz4f0xMm/f8adD+qzZn/bPfw5bMb++LH4Gw==",
    ),
    this.addDataEntry(
      "container swimlane pool horizontal",
      480,
      380,
      "Horizontal Pool 1",
      "zZRLbsIwEIZP4709TlHXhJYNSEicwCIjbNWJkWNKwumZxA6IlrRUaisWlmb+eX8LM5mXzdyrnV66Ai2TL0zm3rkQrbLJ0VoG3BRMzhgAp8fgdSQq+ijfKY9VuKcAYsG7snuMyso5G8U6tDaJ9cGUVlXkTXUoacuZIHOjjS0WqnX7blYd1OZt8KYea3PE1bCI+CAtVUMq7/o5b46uCmroSn18WFMm+XCdse5GpLq0OPqAzejxvZQun6MrMfiWUg6mCDpmZM8RENdotjqVyUFUdRS259oLSzISztto5Se0i44gcHEn3i9A/IQB3GbQpmi69DskAn4BSTaGBB4Jicj+k8nTGBP5SExg8odMyL38eH3s6kM8AQ==",
    ),
    this.addDataEntry(
      "container swimlane pool horizontal",
      480,
      360,
      "Horizontal Pool 2",
      "zZTBbsIwDIafJvfU6dDOlI0LSEg8QUQtEi1tUBJGy9PPbcJQWTsxaZs4VLJ//07sT1WYKKpm6eRBrW2JhokXJgpnbYhR1RRoDAOuSyYWDIDTx+B1opr1VX6QDutwTwPEhndpjhiVjbUmij60Jon+pCsja8rmKlQ05SKjcKe0KVeytcfuLh/k7u2SzR16fcbNZZDsRlrLhlTenWedPts6SJMEOseFLTkph6Fj212RbGlwdAGbyeV7KW2+RFthcC1ZTroMKjry5wiIK9R7ldrELInSR2H/2XtlSUHCOY5WfEG76ggCz+7E+w2InzCAcQapIf0fAySzESQZ/AKSfAoJPCKS9mbzf0H0NIVIPDAiyP8QEaXX97CvDZ7LDw==",
    ),
    this.createVertexTemplateEntry(
      "swimlane;startSize=20;horizontal=0;",
      320,
      120,
      "Lane",
      "Horizontal Swimlane",
      null,
      null,
      "swimlane lane pool",
    ),
    this.addDataEntry(
      "container swimlane pool horizontal",
      360,
      480,
      "Vertical Pool 1",
      "xZRBbsIwEEVP4709ThFrQssGJKSewCIjbNXGyDEl4fSdxKa0NJFQVTULSzP/e+T5b2EmS9esgjrqja/QMvnMZBm8j6lyTYnWMuCmYnLJADgdBi8jruhdflQBD/GRAUgD78qeMClb720S69jaLNZn46w6ULfQ0dGWS0HlThtbrVXrT91bdVS7t2u3CFibC26vi4g7aaMaUjmpNBbiKxnUQyfkjTBEbEZT9VKOtELvMIaWrpxNFXW6IWcpOddo9jqPFfMsqjoJ+8/ZGyQqMqdhZvIHs3WHBrh4kNvvIsNw5Da7OdgXAgKGCMz+gEAxRgCmINDcxZ2CyNMYETkhESj+jwi1t1+r9759ah8=",
    ),
    this.addDataEntry(
      "container swimlane pool vertical",
      380,
      480,
      "Vertical Pool 2",
      "xZTPbsIwDMafJvf86dDOlI0LSEg8QUQtEi1pUBJGy9PPbdJ1G1TqhXGoZH/219g/RSGitM3ay5PaugoMEW9ElN65mCLblGAM4VRXRKwI5xQ/wt8nqqyv0pP0UMc5Bp4Mn9KcISk750wSQ2xNFsNFWyNrzJYqWpxyxTA8KG2qjWzduTsrRHn4GLKlh6CvsBsGYX+krWxQpaiizcc9FjDnnaCc11dXR2lyxyjsuyPy3/Lg4CM0k8v3Ut58Dc5C9C22XHQVVeoQrwkQVaCPKtuKQZQhCcdv78gSg4zzPlpxg3bTEeSUzcR7Q2bWyvz+ytmQr8NPAow/ikAxRYA/kQAr/hPByxQC8cxLsHggAkzH56uv/XrdvgA=",
    ),
    this.createVertexTemplateEntry(
      "swimlane;startSize=20;",
      120,
      320,
      "Lane",
      "Vertical Swimlane",
      null,
      null,
      "swimlane lane pool",
    ),
    this.createVertexTemplateEntry(
      "rounded=1;arcSize=10;dashed=1;strokeColor=#000000;fillColor=none;gradientColor=none;dashPattern=8 3 1 3;strokeWidth=2;",
      200,
      200,
      "",
      "Group",
      null,
      null,
      this.getTagsForStencil(
        "bpmn",
        "group",
        "bpmn business process model ",
      ).join(" "),
    ),
    this.createEdgeTemplateEntry(
      "endArrow=block;endFill=1;endSize=6;html=1;",
      100,
      0,
      "",
      "Sequence Flow",
      null,
      "bpmn sequence flow",
    ),
    this.createEdgeTemplateEntry(
      "startArrow=dash;startSize=8;endArrow=block;endFill=1;endSize=6;html=1;",
      100,
      0,
      "",
      "Default Flow",
      null,
      "bpmn default flow",
    ),
    this.createEdgeTemplateEntry(
      "startArrow=diamondThin;startFill=0;startSize=14;endArrow=block;endFill=1;endSize=6;html=1;",
      100,
      0,
      "",
      "Conditional Flow",
      null,
      "bpmn conditional flow",
    ),
    this.createEdgeTemplateEntry(
      "startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=1;",
      100,
      0,
      "",
      "Message Flow 1",
      null,
      "bpmn message flow",
    ),
    this.addEntry("bpmn message flow", function () {
      var edge = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 0, 0),
        "startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=1;",
      );
      edge.geometry.setTerminalPoint(new m.mxPoint(0, 0), true);
      edge.geometry.setTerminalPoint(new m.mxPoint(100, 0), false);
      edge.geometry.relative = true;
      edge.edge = true;

      var cell = new m.mxCell(
        "",
        new m.mxGeometry(0, 0, 20, 14),
        "shape=message;html=1;outlineConnect=0;",
      );
      cell.geometry.relative = true;
      cell.vertex = true;
      cell.geometry.offset = new m.mxPoint(-10, -7);
      edge.insert(cell);

      return sb.createEdgeTemplateFromCells([edge], 100, 0, "Message Flow 2");
    }),
    this.createEdgeTemplateEntry(
      "shape=link;html=1;",
      100,
      0,
      "",
      "Link",
      null,
      "bpmn link",
    ),
  ];

  this.addPaletteFunctions(
    "bpmn",
    "BPMN " + m.mxResources.get("general"),
    false,
    fns,
  );
  this.setCurrentSearchEntryLibrary();
};

/**
 * Creates and returns the given title element.
 */
Sidebar.prototype.createTitle = function (label) {
  var elt = document.createElement("a");
  elt.setAttribute("title", m.mxResources.get("sidebarTooltip"));
  elt.className = "geTitle";
  m.mxUtils.write(elt, label);

  return elt;
};

/**
 * Creates a thumbnail for the given cells.
 */
Sidebar.prototype.createThumb = function (
  cells,
  width,
  height,
  parent,
  title,
  showLabel,
  showTitle,
  realWidth,
  realHeight,
) {
  this.graph.labelsVisible = showLabel == null || showLabel;
  var fo = m.mxClient.NO_FO;
  m.mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
  this.graph.view.scaleAndTranslate(1, 0, 0);
  this.graph.addCells(cells);
  var bounds = this.graph.getGraphBounds();
  var s =
    Math.floor(
      Math.min(
        (width - 2 * this.thumbBorder) / bounds.width,
        (height - 2 * this.thumbBorder) / bounds.height,
      ) * 100,
    ) / 100;
  this.graph.view.scaleAndTranslate(
    s,
    Math.floor((width - bounds.width * s) / 2 / s - bounds.x),
    Math.floor((height - bounds.height * s) / 2 / s - bounds.y),
  );
  var node = null;

  // For supporting HTML labels in IE9 standards mode the container is cloned instead
  if (
    this.graph.dialect == m.mxConstants.DIALECT_SVG &&
    !m.mxClient.NO_FO &&
    this.graph.view.getCanvas().ownerSVGElement != null
  ) {
    node = this.graph.view.getCanvas().ownerSVGElement.cloneNode(true);
  }
  // LATER: Check if deep clone can be used for quirks if container in DOM
  else {
    node = this.graph.container.cloneNode(false);
    node.innerHTML = this.graph.container.innerHTML;

    // Workaround for clipping in older IE versions
    if (m.mxClient.IS_QUIRKS || document.documentMode == 8) {
      node.firstChild.style.overflow = "visible";
    }
  }

  this.graph.getModel().clear();
  m.mxClient.NO_FO = fo;

  // Catch-all event handling
  if (m.mxClient.IS_IE6) {
    parent.style.backgroundImage =
      "url(" + this.editorUi.editor.transparentImage + ")";
  }

  node.style.position = "relative";
  node.style.overflow = "hidden";
  node.style.left = this.thumbBorder + "px";
  node.style.top = this.thumbBorder + "px";
  node.style.width = width + "px";
  node.style.height = height + "px";
  node.style.visibility = "";
  node.style.minWidth = "";
  node.style.minHeight = "";

  parent.appendChild(node);

  // Adds title for sidebar entries
  if (this.sidebarTitles && title != null && showTitle != false) {
    var border = m.mxClient.IS_QUIRKS ? 2 * this.thumbPadding + 2 : 0;
    parent.style.height =
      this.thumbHeight + border + this.sidebarTitleSize + 8 + "px";

    var div = document.createElement("div");
    div.style.fontSize = this.sidebarTitleSize + "px";
    div.style.color = "#303030";
    div.style.textAlign = "center";
    div.style.whiteSpace = "nowrap";

    if (m.mxClient.IS_IE) {
      div.style.height = this.sidebarTitleSize + 12 + "px";
    }

    div.style.paddingTop = "4px";
    m.mxUtils.write(div, title);
    parent.appendChild(div);
  }

  return bounds;
};

/**
 * Creates and returns a new palette item for the given image.
 */
Sidebar.prototype.createItem = function (
  cells,
  title,
  showLabel,
  showTitle,
  width,
  height,
  allowCellsInserted,
) {
  var elt = document.createElement("a");
  elt.className = "geItem";
  elt.style.overflow = "hidden";
  var border = m.mxClient.IS_QUIRKS
    ? 8 + 2 * this.thumbPadding
    : 2 * this.thumbBorder;
  elt.style.width = this.thumbWidth + border + "px";
  elt.style.height = this.thumbHeight + border + "px";
  elt.style.padding = this.thumbPadding + "px";

  if (m.mxClient.IS_IE6) {
    elt.style.border = "none";
  }

  // Blocks default click action
  m.mxEvent.addListener(elt, "click", function (evt) {
    m.mxEvent.consume(evt);
  });

  this.createThumb(
    cells,
    this.thumbWidth,
    this.thumbHeight,
    elt,
    title,
    showLabel,
    showTitle,
    width,
    height,
  );
  var bounds = new m.mxRectangle(0, 0, width, height);

  if (cells.length > 1 || cells[0].vertex) {
    var ds = this.createDragSource(
      elt,
      this.createDropHandler(cells, true, allowCellsInserted, bounds),
      this.createDragPreview(width, height),
      cells,
      bounds,
    );
    this.addClickHandler(elt, ds, cells);

    // Uses guides for vertices only if enabled in graph
    ds.isGuidesEnabled = m.mxUtils.bind(this, function () {
      return this.editorUi.editor.graph.graphHandler.guidesEnabled;
    });
  } else if (cells[0] != null && cells[0].edge) {
    var ds = this.createDragSource(
      elt,
      this.createDropHandler(cells, false, allowCellsInserted, bounds),
      this.createDragPreview(width, height),
      cells,
      bounds,
    );
    this.addClickHandler(elt, ds, cells);
  }

  // Shows a tooltip with the rendered cell
  if (!m.mxClient.IS_IOS) {
    m.mxEvent.addGestureListeners(
      elt,
      null,
      m.mxUtils.bind(this, function (evt) {
        if (m.mxEvent.isMouseEvent(evt)) {
          this.showTooltip(
            elt,
            cells,
            bounds.width,
            bounds.height,
            title,
            showLabel,
          );
        }
      }),
    );
  }

  return elt;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.updateShapes = function (source, targets) {
  var graph = this.editorUi.editor.graph;
  var sourceCellStyle = graph.getCellStyle(source);
  var result = [];

  graph.model.beginUpdate();
  try {
    var cellStyle = graph.getModel().getStyle(source);

    // Lists the styles to carry over from the existing shape
    var styles = [
      "shadow",
      "dashed",
      "dashPattern",
      "fontFamily",
      "fontSize",
      "fontColor",
      "align",
      "startFill",
      "startSize",
      "endFill",
      "endSize",
      "strokeColor",
      "strokeWidth",
      "fillColor",
      "gradientColor",
      "html",
      "part",
      "noEdgeStyle",
      "edgeStyle",
      "elbow",
      "childLayout",
      "recursiveResize",
      "container",
      "collapsible",
      "connectable",
      "comic",
      "sketch",
      "fillWeight",
      "hachureGap",
      "hachureAngle",
      "jiggle",
      "disableMultiStroke",
      "disableMultiStrokeFill",
      "fillStyle",
      "curveFitting",
      "simplification",
      "sketchStyle",
    ];

    for (var i = 0; i < targets.length; i++) {
      var targetCell = targets[i];

      if (
        graph.getModel().isVertex(targetCell) ==
          graph.getModel().isVertex(source) ||
        graph.getModel().isEdge(targetCell) == graph.getModel().isEdge(source)
      ) {
        var style = graph.getCurrentCellStyle(targets[i]);
        graph.getModel().setStyle(targetCell, cellStyle);

        // Removes all children of composite cells
        if (m.mxUtils.getValue(style, "composite", "0") == "1") {
          var childCount = graph.model.getChildCount(targetCell);

          for (var j = childCount; j >= 0; j--) {
            graph.model.remove(graph.model.getChildAt(targetCell, j));
          }
        }

        // Replaces the participant style in the lifeline shape with the target shape
        if (
          style[m.mxConstants.STYLE_SHAPE] == "umlLifeline" &&
          sourceCellStyle[m.mxConstants.STYLE_SHAPE] != "umlLifeline"
        ) {
          graph.setCellStyles(m.mxConstants.STYLE_SHAPE, "umlLifeline", [
            targetCell,
          ]);
          graph.setCellStyles(
            "participant",
            sourceCellStyle[m.mxConstants.STYLE_SHAPE],
            [targetCell],
          );
        }

        for (var j = 0; j < styles.length; j++) {
          var value = style[styles[j]];

          if (value != null) {
            graph.setCellStyles(styles[j], value, [targetCell]);
          }
        }

        result.push(targetCell);
      }
    }
  } finally {
    graph.model.endUpdate();
  }

  return result;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createDropHandler = function (
  cells,
  allowSplit,
  allowCellsInserted,
  bounds,
) {
  allowCellsInserted = allowCellsInserted != null ? allowCellsInserted : true;

  return m.mxUtils.bind(this, function (graph, evt, target, x, y, force) {
    var elt = force
      ? null
      : m.mxEvent.isTouchEvent(evt) || m.mxEvent.isPenEvent(evt)
      ? document.elementFromPoint(
          m.mxEvent.getClientX(evt),
          m.mxEvent.getClientY(evt),
        )
      : m.mxEvent.getSource(evt);

    while (elt != null && elt != this.container) {
      elt = elt.parentNode;
    }

    if (elt == null && graph.isEnabled()) {
      cells = graph.getImportableCells(cells);

      if (cells.length > 0) {
        graph.stopEditing();

        // Holding alt while mouse is released ignores drop target
        var validDropTarget =
          target != null && !m.mxEvent.isAltDown(evt)
            ? graph.isValidDropTarget(target, cells, evt)
            : false;

        var select = null;

        if (target != null && !validDropTarget) {
          target = null;
        }

        if (!graph.isCellLocked(target || graph.getDefaultParent())) {
          graph.model.beginUpdate();
          try {
            x = Math.round(x);
            y = Math.round(y);

            // Splits the target edge or inserts into target group
            if (allowSplit && graph.isSplitTarget(target, cells, evt)) {
              var s = graph.view.scale;
              var tr = graph.view.translate;
              var tx = (x + tr.x) * s;
              var ty = (y + tr.y) * s;

              var clones = graph.cloneCells(cells);
              graph.splitEdge(
                target,
                clones,
                null,
                x - bounds.width / 2,
                y - bounds.height / 2,
                tx,
                ty,
              );
              select = clones;
            } else if (cells.length > 0) {
              select = graph.importCells(cells, x, y, target);
            }

            // Executes parent layout hooks for position/order
            if (graph.layoutManager != null) {
              var layout = graph.layoutManager.getLayout(target);

              if (layout != null) {
                var s = graph.view.scale;
                var tr = graph.view.translate;
                var tx = (x + tr.x) * s;
                var ty = (y + tr.y) * s;

                for (var i = 0; i < select.length; i++) {
                  layout.moveCell(select[i], tx, ty);
                }
              }
            }

            if (
              allowCellsInserted &&
              (evt == null || !m.mxEvent.isShiftDown(evt))
            ) {
              graph.fireEvent(
                new m.mxEventObject("cellsInserted", "cells", select),
              );
            }
          } catch (e) {
            this.editorUi.handleError(e);
          } finally {
            graph.model.endUpdate();
          }

          if (select != null && select.length > 0) {
            graph.scrollCellToVisible(select[0]);
            graph.setSelectionCells(select);
          }

          if (
            graph.editAfterInsert &&
            evt != null &&
            m.mxEvent.isMouseEvent(evt) &&
            select != null &&
            select.length == 1
          ) {
            window.setTimeout(function () {
              graph.startEditing(select[0]);
            }, 0);
          }
        }
      }

      m.mxEvent.consume(evt);
    }
  });
};

/**
 * Creates and returns a preview element for the given width and height.
 */
Sidebar.prototype.createDragPreview = function (width, height) {
  var elt = document.createElement("div");
  elt.style.border = this.dragPreviewBorder;
  elt.style.width = width + "px";
  elt.style.height = height + "px";

  return elt;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.dropAndConnect = function (
  source,
  targets,
  direction,
  dropCellIndex,
  evt,
) {
  var geo = this.getDropAndConnectGeometry(
    source,
    targets[dropCellIndex],
    direction,
    targets,
  );

  // Targets without the new edge for selection
  var tmp = [];

  if (geo != null) {
    var graph = this.editorUi.editor.graph;
    var editingCell = null;

    graph.model.beginUpdate();
    try {
      var sourceGeo = graph.getCellGeometry(source);
      var geo2 = graph.getCellGeometry(targets[dropCellIndex]);

      // Handles special case where target should be ignored for stack layouts
      var targetParent = graph.model.getParent(source);
      var validLayout = true;

      // Ignores parent if it has a stack layout or if it is a table or row
      if (graph.layoutManager != null) {
        var layout = graph.layoutManager.getLayout(targetParent);

        // LATER: Use parent of parent if valid layout
        if (layout != null && layout.constructor == m.mxStackLayout) {
          validLayout = false;
        }
      }

      // Checks if another container is at the drop location
      var tmp = graph.model.isEdge(source)
        ? null
        : graph.view.getState(targetParent);
      var dx = 0;
      var dy = 0;

      // Offsets by parent position
      if (tmp != null) {
        var offset = tmp.origin;
        dx = offset.x;
        dy = offset.y;

        var pt = geo.getTerminalPoint(false);

        if (pt != null) {
          pt.x += offset.x;
          pt.y += offset.y;
        }
      }

      var useParent =
        !graph.isTableRow(source) &&
        !graph.isTableCell(source) &&
        (graph.model.isEdge(source) ||
          (sourceGeo != null && !sourceGeo.relative && validLayout));

      var tempTarget = graph.getCellAt(
        (geo.x + dx + graph.view.translate.x) * graph.view.scale,
        (geo.y + dy + graph.view.translate.y) * graph.view.scale,
        null,
        null,
        null,
        function (state, x, y) {
          return !graph.isContainer(state.cell);
        },
      );

      if (tempTarget != null && tempTarget != targetParent) {
        tmp = graph.view.getState(tempTarget);

        // Offsets by new parent position
        if (tmp != null) {
          var offset = tmp.origin;
          targetParent = tempTarget;
          useParent = true;

          if (!graph.model.isEdge(source)) {
            geo.x -= offset.x - dx;
            geo.y -= offset.y - dy;
          }
        }
      } else if (
        !validLayout ||
        graph.isTableRow(source) ||
        graph.isTableCell(source)
      ) {
        geo.x += dx;
        geo.y += dy;
      }

      dx = geo2.x;
      dy = geo2.y;

      // Ignores geometry of edges
      if (graph.model.isEdge(targets[dropCellIndex])) {
        dx = 0;
        dy = 0;
      }

      targets = graph.importCells(
        targets,
        geo.x - (useParent ? dx : 0),
        geo.y - (useParent ? dy : 0),
        useParent ? targetParent : null,
      );
      tmp = targets;

      if (graph.model.isEdge(source)) {
        // Adds new terminal to edge
        // LATER: Push new terminal out radially from edge start point
        graph.model.setTerminal(
          source,
          targets[dropCellIndex],
          direction == m.mxConstants.DIRECTION_NORTH,
        );
      } else if (graph.model.isEdge(targets[dropCellIndex])) {
        // Adds new outgoing connection to vertex and clears points
        graph.model.setTerminal(targets[dropCellIndex], source, true);
        var geo3 = graph.getCellGeometry(targets[dropCellIndex]);
        geo3.points = null;

        if (geo3.getTerminalPoint(false) != null) {
          geo3.setTerminalPoint(geo.getTerminalPoint(false), false);
        } else if (useParent && graph.model.isVertex(targetParent)) {
          // Adds parent offset to other nodes
          var tmpState = graph.view.getState(targetParent);
          var offset =
            tmpState.cell != graph.view.currentRoot
              ? tmpState.origin
              : new m.mxPoint(0, 0);

          graph.cellsMoved(targets, offset.x, offset.y, null, null, true);
        }
      } else {
        geo2 = graph.getCellGeometry(targets[dropCellIndex]);
        dx = geo.x - Math.round(geo2.x);
        dy = geo.y - Math.round(geo2.y);
        geo.x = Math.round(geo2.x);
        geo.y = Math.round(geo2.y);
        graph.model.setGeometry(targets[dropCellIndex], geo);
        graph.cellsMoved(targets, dx, dy, null, null, true);
        tmp = targets.slice();
        editingCell = tmp.length == 1 ? tmp[0] : null;
        targets.push(
          graph.insertEdge(
            null,
            null,
            "",
            source,
            targets[dropCellIndex],
            graph.createCurrentEdgeStyle(),
          ),
        );
      }

      if (evt == null || !m.mxEvent.isShiftDown(evt)) {
        graph.fireEvent(new m.mxEventObject("cellsInserted", "cells", targets));
      }
    } catch (e) {
      this.editorUi.handleError(e);
    } finally {
      graph.model.endUpdate();
    }

    if (
      graph.editAfterInsert &&
      evt != null &&
      m.mxEvent.isMouseEvent(evt) &&
      editingCell != null
    ) {
      window.setTimeout(function () {
        graph.startEditing(editingCell);
      }, 0);
    }
  }

  return tmp;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.getDropAndConnectGeometry = function (
  source,
  target,
  direction,
  targets,
) {
  var graph = this.editorUi.editor.graph;
  var view = graph.view;
  var keepSize = targets.length > 1;
  var geo = graph.getCellGeometry(source);
  var geo2 = graph.getCellGeometry(target);

  if (geo != null && geo2 != null) {
    geo2 = geo2.clone();

    if (graph.model.isEdge(source)) {
      var state = graph.view.getState(source);
      var pts = state.absolutePoints;
      var p0 = pts[0];
      var pe = pts[pts.length - 1];

      if (direction == m.mxConstants.DIRECTION_NORTH) {
        geo2.x = p0.x / view.scale - view.translate.x - geo2.width / 2;
        geo2.y = p0.y / view.scale - view.translate.y - geo2.height / 2;
      } else {
        geo2.x = pe.x / view.scale - view.translate.x - geo2.width / 2;
        geo2.y = pe.y / view.scale - view.translate.y - geo2.height / 2;
      }
    } else {
      if (geo.relative) {
        var state = graph.view.getState(source);
        geo = geo.clone();
        geo.x = (state.x - view.translate.x) / view.scale;
        geo.y = (state.y - view.translate.y) / view.scale;
      }

      var length = graph.defaultEdgeLength;

      // Maintains edge length
      if (
        graph.model.isEdge(target) &&
        geo2.getTerminalPoint(true) != null &&
        geo2.getTerminalPoint(false) != null
      ) {
        var p0 = geo2.getTerminalPoint(true);
        var pe = geo2.getTerminalPoint(false);
        var dx = pe.x - p0.x;
        var dy = pe.y - p0.y;

        length = Math.sqrt(dx * dx + dy * dy);

        geo2.x = geo.getCenterX();
        geo2.y = geo.getCenterY();
        geo2.width = 1;
        geo2.height = 1;

        if (direction == m.mxConstants.DIRECTION_NORTH) {
          geo2.height = length;
          geo2.y = geo.y - length;
          geo2.setTerminalPoint(new m.mxPoint(geo2.x, geo2.y), false);
        } else if (direction == m.mxConstants.DIRECTION_EAST) {
          geo2.width = length;
          geo2.x = geo.x + geo.width;
          geo2.setTerminalPoint(
            new m.mxPoint(geo2.x + geo2.width, geo2.y),
            false,
          );
        } else if (direction == m.mxConstants.DIRECTION_SOUTH) {
          geo2.height = length;
          geo2.y = geo.y + geo.height;
          geo2.setTerminalPoint(
            new m.mxPoint(geo2.x, geo2.y + geo2.height),
            false,
          );
        } else if (direction == m.mxConstants.DIRECTION_WEST) {
          geo2.width = length;
          geo2.x = geo.x - length;
          geo2.setTerminalPoint(new m.mxPoint(geo2.x, geo2.y), false);
        }
      } else {
        // Try match size or ignore if width or height < 45 which
        // is considered special enough to be ignored here
        if (
          !keepSize &&
          geo2.width > 45 &&
          geo2.height > 45 &&
          geo.width > 45 &&
          geo.height > 45
        ) {
          geo2.width = geo2.width * (geo.height / geo2.height);
          geo2.height = geo.height;
        }

        geo2.x = geo.x + geo.width / 2 - geo2.width / 2;
        geo2.y = geo.y + geo.height / 2 - geo2.height / 2;

        if (direction == m.mxConstants.DIRECTION_NORTH) {
          geo2.y = geo2.y - geo.height / 2 - geo2.height / 2 - length;
        } else if (direction == m.mxConstants.DIRECTION_EAST) {
          geo2.x = geo2.x + geo.width / 2 + geo2.width / 2 + length;
        } else if (direction == m.mxConstants.DIRECTION_SOUTH) {
          geo2.y = geo2.y + geo.height / 2 + geo2.height / 2 + length;
        } else if (direction == m.mxConstants.DIRECTION_WEST) {
          geo2.x = geo2.x - geo.width / 2 - geo2.width / 2 - length;
        }

        // Adds offset to match cells without connecting edge
        if (
          graph.model.isEdge(target) &&
          geo2.getTerminalPoint(true) != null &&
          target.getTerminal(false) != null
        ) {
          var targetGeo = graph.getCellGeometry(target.getTerminal(false));

          if (targetGeo != null) {
            if (direction == m.mxConstants.DIRECTION_NORTH) {
              geo2.x -= targetGeo.getCenterX();
              geo2.y -= targetGeo.getCenterY() + targetGeo.height / 2;
            } else if (direction == m.mxConstants.DIRECTION_EAST) {
              geo2.x -= targetGeo.getCenterX() - targetGeo.width / 2;
              geo2.y -= targetGeo.getCenterY();
            } else if (direction == m.mxConstants.DIRECTION_SOUTH) {
              geo2.x -= targetGeo.getCenterX();
              geo2.y -= targetGeo.getCenterY() - targetGeo.height / 2;
            } else if (direction == m.mxConstants.DIRECTION_WEST) {
              geo2.x -= targetGeo.getCenterX() + targetGeo.width / 2;
              geo2.y -= targetGeo.getCenterY();
            }
          }
        }
      }
    }
  }

  return geo2;
};

/**
 * Limits drop style to non-transparent source shapes.
 */
Sidebar.prototype.isDropStyleEnabled = function (cells, firstVertex) {
  var result = true;

  if (firstVertex != null && cells.length == 1) {
    var vstyle = this.graph.getCellStyle(cells[firstVertex]);

    if (vstyle != null) {
      result =
        m.mxUtils.getValue(
          vstyle,
          m.mxConstants.STYLE_STROKECOLOR,
          m.mxConstants.NONE,
        ) != m.mxConstants.NONE ||
        m.mxUtils.getValue(
          vstyle,
          m.mxConstants.STYLE_FILLCOLOR,
          m.mxConstants.NONE,
        ) != m.mxConstants.NONE;
    }
  }

  return result;
};

/**
 * Ignores swimlanes as drop style targets.
 */
Sidebar.prototype.isDropStyleTargetIgnored = function (state) {
  return (
    this.graph.isSwimlane(state.cell) ||
    this.graph.isTableCell(state.cell) ||
    this.graph.isTableRow(state.cell) ||
    this.graph.isTable(state.cell)
  );
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.createDragSource = function (
  elt,
  dropHandler,
  preview,
  cells,
  bounds,
) {
  // Checks if the cells contain any vertices
  var ui = this.editorUi;
  var graph = ui.editor.graph;
  var freeSourceEdge = null;
  var firstVertex = null;
  var sidebar = this;

  for (var i = 0; i < cells.length; i++) {
    if (firstVertex == null && graph.model.isVertex(cells[i])) {
      firstVertex = i;
    } else if (
      freeSourceEdge == null &&
      graph.model.isEdge(cells[i]) &&
      graph.model.getTerminal(cells[i], true) == null
    ) {
      freeSourceEdge = i;
    }

    if (firstVertex != null && freeSourceEdge != null) {
      break;
    }
  }

  var dropStyleEnabled = this.isDropStyleEnabled(cells, firstVertex);

  var dragSource = m.mxUtils.makeDraggable(
    elt,
    graph,
    m.mxUtils.bind(this, function (graph, evt, target, x, y) {
      if (this.updateThread != null) {
        window.clearTimeout(this.updateThread);
      }

      if (
        cells != null &&
        currentStyleTarget != null &&
        activeArrow == styleTarget
      ) {
        var tmp = graph.isCellSelected(currentStyleTarget.cell)
          ? graph.getSelectionCells()
          : [currentStyleTarget.cell];
        var updatedCells = this.updateShapes(
          graph.model.isEdge(currentStyleTarget.cell)
            ? cells[0]
            : cells[firstVertex],
          tmp,
        );
        graph.setSelectionCells(updatedCells);
      } else if (
        cells != null &&
        activeArrow != null &&
        currentTargetState != null &&
        activeArrow != styleTarget
      ) {
        var index =
          graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null
            ? firstVertex
            : freeSourceEdge;
        graph.setSelectionCells(
          this.dropAndConnect(
            currentTargetState.cell,
            cells,
            direction,
            index,
            evt,
          ),
        );
      } else {
        dropHandler.apply(this, arguments);
      }

      if (this.editorUi.hoverIcons != null) {
        this.editorUi.hoverIcons.update(
          graph.view.getState(graph.getSelectionCell()),
        );
      }
    }),
    preview,
    0,
    0,
    graph.autoscroll,
    true,
    true,
  );

  // Stops dragging if cancel is pressed
  graph.addListener(m.mxEvent.ESCAPE, function (sender, evt) {
    if (dragSource.isActive()) {
      dragSource.reset();
    }
  });

  // Overrides mouseDown to ignore popup triggers
  var mouseDown = dragSource.mouseDown;

  dragSource.mouseDown = function (evt) {
    if (!m.mxEvent.isPopupTrigger(evt) && !m.mxEvent.isMultiTouchEvent(evt)) {
      graph.stopEditing();
      mouseDown.apply(this, arguments);
    }
  };

  // Workaround for event redirection via image tag in quirks and IE8
  function createArrow(img, tooltip) {
    var arrow = null;

    if (m.mxClient.IS_IE && !m.mxClient.IS_SVG) {
      // Workaround for PNG images in IE6
      if (m.mxClient.IS_IE6 && document.compatMode != "CSS1Compat") {
        arrow = document.createElement(m.mxClient.VML_PREFIX + ":image");
        arrow.setAttribute("src", img.src);
        arrow.style.borderStyle = "none";
      } else {
        arrow = document.createElement("div");
        arrow.style.backgroundImage = "url(" + img.src + ")";
        arrow.style.backgroundPosition = "center";
        arrow.style.backgroundRepeat = "no-repeat";
      }

      arrow.style.width = img.width + 4 + "px";
      arrow.style.height = img.height + 4 + "px";
      arrow.style.display = m.mxClient.IS_QUIRKS ? "inline" : "inline-block";
    } else {
      arrow = m.mxUtils.createImage(img.src);
      arrow.style.width = img.width + "px";
      arrow.style.height = img.height + "px";
    }

    if (tooltip != null) {
      arrow.setAttribute("title", tooltip);
    }
    //m.mxUtils.setOpacity(arrow, img == this.refreshTarget ? 30 : 20);    /*GS-PD*/
    arrow.style.position = "absolute";
    arrow.style.cursor = "crosshair";

    return arrow;
  }

  var currentTargetState = null;
  var currentStateHandle = null;
  var currentStyleTarget = null;
  var activeTarget = false;

  //console.dir(this);
  //console.dir(this.refreshTarget);
  var arrowUp = createArrow(this.triangleUp, m.mxResources.get("connect"));
  var arrowRight = createArrow(
    this.triangleRight,
    m.mxResources.get("connect"),
  );
  var arrowDown = createArrow(this.triangleDown, m.mxResources.get("connect"));
  var arrowLeft = createArrow(this.triangleLeft, m.mxResources.get("connect"));
  var styleTarget = createArrow(
    this.refreshTarget,
    m.mxResources.get("replace"),
  );
  // Workaround for actual parentNode not being updated in old IE
  var styleTargetParent = null;
  var roundSource = createArrow(this.roundDrop);
  var roundTarget = createArrow(this.roundDrop);
  var direction = m.mxConstants.DIRECTION_NORTH;
  var activeArrow = null;

  function checkArrow(x, y, bounds, arrow) {
    if (arrow.parentNode != null) {
      if (m.mxUtils.contains(bounds, x, y)) {
        m.mxUtils.setOpacity(arrow, 100);
        activeArrow = arrow;
      } else {
        m.mxUtils.setOpacity(arrow, arrow == styleTarget ? 30 : 20);
      }
    }

    return bounds;
  }

  // Hides guides and preview if target is active
  var dsCreatePreviewElement = dragSource.createPreviewElement;

  // Stores initial size of preview element
  dragSource.createPreviewElement = function (graph) {
    var elt = dsCreatePreviewElement.apply(this, arguments);

    // Pass-through events required to tooltip on replace shape
    if (m.mxClient.IS_SVG) {
      elt.style.pointerEvents = "none";
    }

    this.previewElementWidth = elt.style.width;
    this.previewElementHeight = elt.style.height;

    return elt;
  };

  // Shows/hides hover icons
  var dragEnter = dragSource.dragEnter;
  dragSource.dragEnter = function (graph, evt) {
    if (ui.hoverIcons != null) {
      ui.hoverIcons.setDisplay("none");
    }

    dragEnter.apply(this, arguments);
  };

  var dragExit = dragSource.dragExit;
  dragSource.dragExit = function (graph, evt) {
    if (ui.hoverIcons != null) {
      ui.hoverIcons.setDisplay("");
    }

    dragExit.apply(this, arguments);
  };

  dragSource.dragOver = function (graph, evt) {
    m.mxDragSource.prototype.dragOver.apply(this, arguments);

    if (this.currentGuide != null && activeArrow != null) {
      this.currentGuide.hide();
    }

    if (this.previewElement != null) {
      var view = graph.view;

      if (currentStyleTarget != null && activeArrow == styleTarget) {
        this.previewElement.style.display = graph.model.isEdge(
          currentStyleTarget.cell,
        )
          ? "none"
          : "";

        this.previewElement.style.left = currentStyleTarget.x + "px";
        this.previewElement.style.top = currentStyleTarget.y + "px";
        this.previewElement.style.width = currentStyleTarget.width + "px";
        this.previewElement.style.height = currentStyleTarget.height + "px";
      } else if (currentTargetState != null && activeArrow != null) {
        if (
          dragSource.currentHighlight != null &&
          dragSource.currentHighlight.state != null
        ) {
          dragSource.currentHighlight.hide();
        }

        var index =
          graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null
            ? firstVertex
            : freeSourceEdge;
        var geo = sidebar.getDropAndConnectGeometry(
          currentTargetState.cell,
          cells[index],
          direction,
          cells,
        );
        var geo2 = !graph.model.isEdge(currentTargetState.cell)
          ? graph.getCellGeometry(currentTargetState.cell)
          : null;
        var geo3 = graph.getCellGeometry(cells[index]);
        var parent = graph.model.getParent(currentTargetState.cell);
        var dx = view.translate.x * view.scale;
        var dy = view.translate.y * view.scale;

        if (
          geo2 != null &&
          !geo2.relative &&
          graph.model.isVertex(parent) &&
          parent != view.currentRoot
        ) {
          var pState = view.getState(parent);

          dx = pState.x;
          dy = pState.y;
        }

        var dx2 = geo3.x;
        var dy2 = geo3.y;

        // Ignores geometry of edges
        if (graph.model.isEdge(cells[index])) {
          dx2 = 0;
          dy2 = 0;
        }

        // Shows preview at drop location
        this.previewElement.style.left = (geo.x - dx2) * view.scale + dx + "px";
        this.previewElement.style.top = (geo.y - dy2) * view.scale + dy + "px";

        if (cells.length == 1) {
          this.previewElement.style.width = geo.width * view.scale + "px";
          this.previewElement.style.height = geo.height * view.scale + "px";
        }

        this.previewElement.style.display = "";
      } else if (
        dragSource.currentHighlight.state != null &&
        graph.model.isEdge(dragSource.currentHighlight.state.cell)
      ) {
        // Centers drop cells when splitting edges
        this.previewElement.style.left =
          Math.round(
            parseInt(this.previewElement.style.left) -
              (bounds.width * view.scale) / 2,
          ) + "px";
        this.previewElement.style.top =
          Math.round(
            parseInt(this.previewElement.style.top) -
              (bounds.height * view.scale) / 2,
          ) + "px";
      } else {
        this.previewElement.style.width = this.previewElementWidth;
        this.previewElement.style.height = this.previewElementHeight;
        this.previewElement.style.display = "";
      }
    }
  };

  var startTime = new Date().getTime();
  var timeOnTarget = 0;
  var prev = null;

  // Gets source cell style to compare shape below
  var sourceCellStyle = this.editorUi.editor.graph.getCellStyle(cells[0]);

  // Allows drop into cell only if target is a valid root
  dragSource.getDropTarget = m.mxUtils.bind(this, function (graph, x, y, evt) {
    // Alt means no targets at all
    // LATER: Show preview where result will go
    var cell =
      !m.mxEvent.isAltDown(evt) && cells != null
        ? graph.getCellAt(x, y, null, null, null, function (state, x, y) {
            return graph.isContainer(state.cell);
          })
        : null;

    // Uses connectable parent vertex if one exists
    if (
      cell != null &&
      !this.graph.isCellConnectable(cell) &&
      !this.graph.model.isEdge(cell)
    ) {
      var parent = this.graph.getModel().getParent(cell);

      if (
        this.graph.getModel().isVertex(parent) &&
        this.graph.isCellConnectable(parent)
      ) {
        cell = parent;
      }
    }

    // Ignores locked cells
    if (graph.isCellLocked(cell)) {
      cell = null;
    }

    var state = graph.view.getState(cell);
    activeArrow = null;
    var bbox = null;

    // Time on target
    if (prev != state) {
      startTime = new Date().getTime();
      timeOnTarget = 0;
      prev = state;

      if (this.updateThread != null) {
        window.clearTimeout(this.updateThread);
      }

      if (state != null) {
        this.updateThread = window.setTimeout(function () {
          if (activeArrow == null) {
            prev = state;
            dragSource.getDropTarget(graph, x, y, evt);
          }
        }, this.dropTargetDelay + 10);
      }
    } else {
      timeOnTarget = new Date().getTime() - startTime;
    }

    // Shift means disabled, delayed on cells with children, shows after this.dropTargetDelay, hides after 2500ms
    if (
      dropStyleEnabled &&
      timeOnTarget < 2500 &&
      state != null &&
      !m.mxEvent.isShiftDown(evt) &&
      // If shape is equal or target has no stroke, fill and gradient then use longer delay except for images
      ((m.mxUtils.getValue(state.style, m.mxConstants.STYLE_SHAPE) !=
        m.mxUtils.getValue(sourceCellStyle, m.mxConstants.STYLE_SHAPE) &&
        (m.mxUtils.getValue(
          state.style,
          m.mxConstants.STYLE_STROKECOLOR,
          m.mxConstants.NONE,
        ) != m.mxConstants.NONE ||
          m.mxUtils.getValue(
            state.style,
            m.mxConstants.STYLE_FILLCOLOR,
            m.mxConstants.NONE,
          ) != m.mxConstants.NONE ||
          m.mxUtils.getValue(
            state.style,
            m.mxConstants.STYLE_GRADIENTCOLOR,
            m.mxConstants.NONE,
          ) != m.mxConstants.NONE)) ||
        m.mxUtils.getValue(sourceCellStyle, m.mxConstants.STYLE_SHAPE) ==
          "image" ||
        timeOnTarget > 1500 ||
        graph.model.isEdge(state.cell)) &&
      timeOnTarget > this.dropTargetDelay &&
      !this.isDropStyleTargetIgnored(state) &&
      ((graph.model.isVertex(state.cell) && firstVertex != null) ||
        (graph.model.isEdge(state.cell) && graph.model.isEdge(cells[0])))
    ) {
      currentStyleTarget = state;
      var tmp = graph.model.isEdge(state.cell)
        ? graph.view.getPoint(state)
        : new m.mxPoint(state.getCenterX(), state.getCenterY());
      tmp = new m.mxRectangle(
        tmp.x - this.refreshTarget.width / 2,
        tmp.y - this.refreshTarget.height / 2,
        this.refreshTarget.width,
        this.refreshTarget.height,
      );

      styleTarget.style.left = Math.floor(tmp.x) + "px";
      styleTarget.style.top = Math.floor(tmp.y) + "px";

      if (styleTargetParent == null) {
        graph.container.appendChild(styleTarget);
        styleTargetParent = styleTarget.parentNode;
      }

      checkArrow(x, y, tmp, styleTarget);
    }
    // Does not reset on ignored edges
    else if (
      currentStyleTarget == null ||
      !m.mxUtils.contains(currentStyleTarget, x, y) ||
      (timeOnTarget > 1500 && !m.mxEvent.isShiftDown(evt))
    ) {
      currentStyleTarget = null;

      if (styleTargetParent != null) {
        styleTarget.parentNode.removeChild(styleTarget);
        styleTargetParent = null;
      }
    } else if (currentStyleTarget != null && styleTargetParent != null) {
      // Sets active Arrow as side effect
      var tmp = graph.model.isEdge(currentStyleTarget.cell)
        ? graph.view.getPoint(currentStyleTarget)
        : new m.mxPoint(
            currentStyleTarget.getCenterX(),
            currentStyleTarget.getCenterY(),
          );
      tmp = new m.mxRectangle(
        tmp.x - this.refreshTarget.width / 2,
        tmp.y - this.refreshTarget.height / 2,
        this.refreshTarget.width,
        this.refreshTarget.height,
      );
      checkArrow(x, y, tmp, styleTarget);
    }

    // Checks if inside bounds
    if (
      activeTarget &&
      currentTargetState != null &&
      !m.mxEvent.isAltDown(evt) &&
      activeArrow == null
    ) {
      // LATER: Use hit-detection for edges
      bbox = m.mxRectangle.fromRectangle(currentTargetState);

      if (graph.model.isEdge(currentTargetState.cell)) {
        var pts = currentTargetState.absolutePoints;

        if (roundSource.parentNode != null) {
          var p0 = pts[0];
          bbox.add(
            checkArrow(
              x,
              y,
              new m.mxRectangle(
                p0.x - this.roundDrop.width / 2,
                p0.y - this.roundDrop.height / 2,
                this.roundDrop.width,
                this.roundDrop.height,
              ),
              roundSource,
            ),
          );
        }

        if (roundTarget.parentNode != null) {
          var pe = pts[pts.length - 1];
          bbox.add(
            checkArrow(
              x,
              y,
              new m.mxRectangle(
                pe.x - this.roundDrop.width / 2,
                pe.y - this.roundDrop.height / 2,
                this.roundDrop.width,
                this.roundDrop.height,
              ),
              roundTarget,
            ),
          );
        }
      } else {
        var bds = m.mxRectangle.fromRectangle(currentTargetState);

        // Uses outer bounding box to take rotation into account
        if (
          currentTargetState.shape != null &&
          currentTargetState.shape.boundingBox != null
        ) {
          bds = m.mxRectangle.fromRectangle(
            currentTargetState.shape.boundingBox,
          );
        }

        bds.grow(this.graph.tolerance);
        bds.grow(HoverIcons.prototype.arrowSpacing);

        var handler = this.graph.selectionCellsHandler.getHandler(
          currentTargetState.cell,
        );

        if (handler != null) {
          bds.x -= handler.horizontalOffset / 2;
          bds.y -= handler.verticalOffset / 2;
          bds.width += handler.horizontalOffset;
          bds.height += handler.verticalOffset;

          // Adds bounding box of rotation handle to avoid overlap
          if (
            handler.rotationShape != null &&
            handler.rotationShape.node != null &&
            handler.rotationShape.node.style.visibility != "hidden" &&
            handler.rotationShape.node.style.display != "none" &&
            handler.rotationShape.boundingBox != null
          ) {
            bds.add(handler.rotationShape.boundingBox);
          }
        }

        bbox.add(
          checkArrow(
            x,
            y,
            new m.mxRectangle(
              currentTargetState.getCenterX() - this.triangleUp.width / 2,
              bds.y - this.triangleUp.height,
              this.triangleUp.width,
              this.triangleUp.height,
            ),
            arrowUp,
          ),
        );
        bbox.add(
          checkArrow(
            x,
            y,
            new m.mxRectangle(
              bds.x + bds.width,
              currentTargetState.getCenterY() - this.triangleRight.height / 2,
              this.triangleRight.width,
              this.triangleRight.height,
            ),
            arrowRight,
          ),
        );
        bbox.add(
          checkArrow(
            x,
            y,
            new m.mxRectangle(
              currentTargetState.getCenterX() - this.triangleDown.width / 2,
              bds.y + bds.height,
              this.triangleDown.width,
              this.triangleDown.height,
            ),
            arrowDown,
          ),
        );
        bbox.add(
          checkArrow(
            x,
            y,
            new m.mxRectangle(
              bds.x - this.triangleLeft.width,
              currentTargetState.getCenterY() - this.triangleLeft.height / 2,
              this.triangleLeft.width,
              this.triangleLeft.height,
            ),
            arrowLeft,
          ),
        );
      }

      // Adds tolerance
      if (bbox != null) {
        bbox.grow(10);
      }
    }

    direction = m.mxConstants.DIRECTION_NORTH;

    if (activeArrow == arrowRight) {
      direction = m.mxConstants.DIRECTION_EAST;
    } else if (activeArrow == arrowDown || activeArrow == roundTarget) {
      direction = m.mxConstants.DIRECTION_SOUTH;
    } else if (activeArrow == arrowLeft) {
      direction = m.mxConstants.DIRECTION_WEST;
    }

    if (currentStyleTarget != null && activeArrow == styleTarget) {
      state = currentStyleTarget;
    }

    var validTarget =
      (firstVertex == null || graph.isCellConnectable(cells[firstVertex])) &&
      ((graph.model.isEdge(cell) && firstVertex != null) ||
        (graph.model.isVertex(cell) && graph.isCellConnectable(cell)));

    // Drop arrows shown after this.dropTargetDelay, hidden after 5 secs, switches arrows after 500ms
    if (
      (currentTargetState != null && timeOnTarget >= 5000) ||
      (currentTargetState != state &&
        (bbox == null ||
          !m.mxUtils.contains(bbox, x, y) ||
          (timeOnTarget > 500 && activeArrow == null && validTarget)))
    ) {
      activeTarget = false;
      currentTargetState =
        (timeOnTarget < 5000 && timeOnTarget > this.dropTargetDelay) ||
        graph.model.isEdge(cell)
          ? state
          : null;

      if (currentTargetState != null && validTarget) {
        var elts = [
          roundSource,
          roundTarget,
          arrowUp,
          arrowRight,
          arrowDown,
          arrowLeft,
        ];

        for (var i = 0; i < elts.length; i++) {
          if (elts[i].parentNode != null) {
            elts[i].parentNode.removeChild(elts[i]);
          }
        }

        if (graph.model.isEdge(cell)) {
          var pts = state.absolutePoints;

          if (pts != null) {
            var p0 = pts[0];
            var pe = pts[pts.length - 1];
            var tol = graph.tolerance;
            var box = new m.mxRectangle(x - tol, y - tol, 2 * tol, 2 * tol);

            roundSource.style.left =
              Math.floor(p0.x - this.roundDrop.width / 2) + "px";
            roundSource.style.top =
              Math.floor(p0.y - this.roundDrop.height / 2) + "px";

            roundTarget.style.left =
              Math.floor(pe.x - this.roundDrop.width / 2) + "px";
            roundTarget.style.top =
              Math.floor(pe.y - this.roundDrop.height / 2) + "px";

            if (graph.model.getTerminal(cell, true) == null) {
              graph.container.appendChild(roundSource);
            }

            if (graph.model.getTerminal(cell, false) == null) {
              graph.container.appendChild(roundTarget);
            }
          }
        } else {
          var bds = m.mxRectangle.fromRectangle(state);

          // Uses outer bounding box to take rotation into account
          if (state.shape != null && state.shape.boundingBox != null) {
            bds = m.mxRectangle.fromRectangle(state.shape.boundingBox);
          }

          bds.grow(this.graph.tolerance);
          bds.grow(HoverIcons.prototype.arrowSpacing);

          var handler = this.graph.selectionCellsHandler.getHandler(state.cell);

          if (handler != null) {
            bds.x -= handler.horizontalOffset / 2;
            bds.y -= handler.verticalOffset / 2;
            bds.width += handler.horizontalOffset;
            bds.height += handler.verticalOffset;

            // Adds bounding box of rotation handle to avoid overlap
            if (
              handler.rotationShape != null &&
              handler.rotationShape.node != null &&
              handler.rotationShape.node.style.visibility != "hidden" &&
              handler.rotationShape.node.style.display != "none" &&
              handler.rotationShape.boundingBox != null
            ) {
              bds.add(handler.rotationShape.boundingBox);
            }
          }

          arrowUp.style.left =
            Math.floor(state.getCenterX() - this.triangleUp.width / 2) + "px";
          arrowUp.style.top = Math.floor(bds.y - this.triangleUp.height) + "px";

          arrowRight.style.left = Math.floor(bds.x + bds.width) + "px";
          arrowRight.style.top =
            Math.floor(state.getCenterY() - this.triangleRight.height / 2) +
            "px";

          arrowDown.style.left = arrowUp.style.left;
          arrowDown.style.top = Math.floor(bds.y + bds.height) + "px";

          arrowLeft.style.left =
            Math.floor(bds.x - this.triangleLeft.width) + "px";
          arrowLeft.style.top = arrowRight.style.top;

          if (state.style["portConstraint"] != "eastwest") {
            graph.container.appendChild(arrowUp);
            graph.container.appendChild(arrowDown);
          }

          graph.container.appendChild(arrowRight);
          graph.container.appendChild(arrowLeft);
        }

        // Hides handle for cell under mouse
        if (state != null) {
          currentStateHandle = graph.selectionCellsHandler.getHandler(
            state.cell,
          );

          if (
            currentStateHandle != null &&
            currentStateHandle.setHandlesVisible != null
          ) {
            currentStateHandle.setHandlesVisible(false);
          }
        }

        activeTarget = true;
      } else {
        var elts = [
          roundSource,
          roundTarget,
          arrowUp,
          arrowRight,
          arrowDown,
          arrowLeft,
        ];

        for (var i = 0; i < elts.length; i++) {
          if (elts[i].parentNode != null) {
            elts[i].parentNode.removeChild(elts[i]);
          }
        }
      }
    }

    if (!activeTarget && currentStateHandle != null) {
      currentStateHandle.setHandlesVisible(true);
    }

    // Handles drop target
    var target =
      (!m.mxEvent.isAltDown(evt) || m.mxEvent.isShiftDown(evt)) &&
      !(currentStyleTarget != null && activeArrow == styleTarget)
        ? m.mxDragSource.prototype.getDropTarget.apply(this, arguments)
        : null;
    var model = graph.getModel();

    if (target != null) {
      if (activeArrow != null || !graph.isSplitTarget(target, cells, evt)) {
        // Selects parent group as drop target
        while (
          target != null &&
          !graph.isValidDropTarget(target, cells, evt) &&
          model.isVertex(model.getParent(target))
        ) {
          target = model.getParent(target);
        }

        if (
          target != null &&
          (graph.view.currentRoot == target ||
            (!graph.isValidRoot(target) &&
              graph.getModel().getChildCount(target) == 0) ||
            graph.isCellLocked(target) ||
            model.isEdge(target) ||
            !graph.isValidDropTarget(target, cells, evt))
        ) {
          target = null;
        }
      }
    }

    return target;
  });

  dragSource.stopDrag = function () {
    m.mxDragSource.prototype.stopDrag.apply(this, arguments);

    var elts = [
      roundSource,
      roundTarget,
      styleTarget,
      arrowUp,
      arrowRight,
      arrowDown,
      arrowLeft,
    ];

    for (var i = 0; i < elts.length; i++) {
      if (elts[i].parentNode != null) {
        elts[i].parentNode.removeChild(elts[i]);
      }
    }

    if (currentTargetState != null && currentStateHandle != null) {
      currentStateHandle.reset();
    }

    currentStateHandle = null;
    currentTargetState = null;
    currentStyleTarget = null;
    styleTargetParent = null;
    activeArrow = null;
  };

  return dragSource;
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.itemClicked = function (cells, ds, evt, elt) {
  var graph = this.editorUi.editor.graph;
  graph.container.focus();

  // Alt+Click inserts and connects
  if (
    m.mxEvent.isAltDown(evt) &&
    graph.getSelectionCount() == 1 &&
    graph.model.isVertex(graph.getSelectionCell())
  ) {
    var firstVertex = null;

    for (var i = 0; i < cells.length && firstVertex == null; i++) {
      if (graph.model.isVertex(cells[i])) {
        firstVertex = i;
      }
    }

    if (firstVertex != null) {
      graph.setSelectionCells(
        this.dropAndConnect(
          graph.getSelectionCell(),
          cells,
          m.mxEvent.isMetaDown(evt) || m.mxEvent.isControlDown(evt)
            ? m.mxEvent.isShiftDown(evt)
              ? m.mxConstants.DIRECTION_WEST
              : m.mxConstants.DIRECTION_NORTH
            : m.mxEvent.isShiftDown(evt)
            ? m.mxConstants.DIRECTION_EAST
            : m.mxConstants.DIRECTION_SOUTH,
          firstVertex,
          evt,
        ),
      );
      graph.scrollCellToVisible(graph.getSelectionCell());
    }
  }
  // Shift+Click updates shape
  else if (m.mxEvent.isShiftDown(evt) && !graph.isSelectionEmpty()) {
    this.updateShapes(cells[0], graph.getSelectionCells());
    graph.scrollCellToVisible(graph.getSelectionCell());
  } else {
    var pt = m.mxEvent.isAltDown(evt)
      ? graph.getFreeInsertPoint()
      : graph.getCenterInsertPoint(
          graph.getBoundingBoxFromGeometry(cells, true),
        );
    ds.drop(graph, evt, null, pt.x, pt.y, true);
  }
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.addClickHandler = function (elt, ds, cells) {
  var graph = this.editorUi.editor.graph;
  var oldMouseDown = ds.mouseDown;
  var oldMouseMove = ds.mouseMove;
  var oldMouseUp = ds.mouseUp;
  var tol = graph.tolerance;
  var first = null;
  var sb = this;

  ds.mouseDown = function (evt) {
    oldMouseDown.apply(this, arguments);
    first = new m.mxPoint(m.mxEvent.getClientX(evt), m.mxEvent.getClientY(evt));

    if (this.dragElement != null) {
      this.dragElement.style.display = "none";
      m.mxUtils.setOpacity(elt, 50);
    }
  };

  ds.mouseMove = function (evt) {
    if (
      this.dragElement != null &&
      this.dragElement.style.display == "none" &&
      first != null &&
      (Math.abs(first.x - m.mxEvent.getClientX(evt)) > tol ||
        Math.abs(first.y - m.mxEvent.getClientY(evt)) > tol)
    ) {
      this.dragElement.style.display = "";
      m.mxUtils.setOpacity(elt, 100);
    }

    oldMouseMove.apply(this, arguments);
  };

  ds.mouseUp = function (evt) {
    try {
      if (
        !m.mxEvent.isPopupTrigger(evt) &&
        this.currentGraph == null &&
        this.dragElement != null &&
        this.dragElement.style.display == "none"
      ) {
        sb.itemClicked(cells, ds, evt, elt);
      }

      oldMouseUp.apply(ds, arguments);
      m.mxUtils.setOpacity(elt, 100);
      first = null;

      // Blocks tooltips on this element after single click
      sb.currentElt = elt;
    } catch (e) {
      ds.reset();
      sb.editorUi.handleError(e);
    }
  };
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateEntry = function (
  style,
  width,
  height,
  value,
  title,
  showLabel,
  showTitle,
  tags,
) {
  tags =
    tags != null && tags.length > 0
      ? tags
      : title != null
      ? title.toLowerCase()
      : "";

  return this.addEntry(
    tags,
    m.mxUtils.bind(this, function () {
      return this.createVertexTemplate(
        style,
        width,
        height,
        value,
        title,
        showLabel,
        showTitle,
      );
    }),
  );
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplate = function (
  style,
  width,
  height,
  value,
  title,
  showLabel,
  showTitle,
  allowCellsInserted,
) {
  var cells = [
    new m.mxCell(
      value != null ? value : "",
      new m.mxGeometry(0, 0, width, height),
      style,
    ),
  ];
  cells[0].vertex = true;

  return this.createVertexTemplateFromCells(
    cells,
    width,
    height,
    title,
    showLabel,
    showTitle,
    allowCellsInserted,
  );
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateFromData = function (
  data,
  width,
  height,
  title,
  showLabel,
  showTitle,
  allowCellsInserted,
) {
  var doc = m.mxUtils.parseXml(Graph.decompress(data));
  var codec = new m.mxCodec(doc);

  var model = new m.mxGraphModel();
  codec.decode(doc.documentElement, model);

  var cells = this.graph.cloneCells(model.root.getChildAt(0).children);

  return this.createVertexTemplateFromCells(
    cells,
    width,
    height,
    title,
    showLabel,
    showTitle,
    allowCellsInserted,
  );
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createVertexTemplateFromCells = function (
  cells,
  width,
  height,
  title,
  showLabel,
  showTitle,
  allowCellsInserted,
) {
  // Use this line to convert calls to this function with lots of boilerplate code for creating cells
  //console.trace('xml', Graph.compress(mxUtils.getXml(this.graph.encodeCells(cells))), cells);
  return this.createItem(
    cells,
    title,
    showLabel,
    showTitle,
    width,
    height,
    allowCellsInserted,
  );
};

/**
 *
 */
Sidebar.prototype.createEdgeTemplateEntry = function (
  style,
  width,
  height,
  value,
  title,
  showLabel,
  tags,
  allowCellsInserted,
) {
  tags = tags != null && tags.length > 0 ? tags : title.toLowerCase();

  return this.addEntry(
    tags,
    m.mxUtils.bind(this, function () {
      return this.createEdgeTemplate(
        style,
        width,
        height,
        value,
        title,
        showLabel,
        allowCellsInserted,
      );
    }),
  );
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplate = function (
  style,
  width,
  height,
  value,
  title,
  showLabel,
  allowCellsInserted,
) {
  var cell = new m.mxCell(
    value != null ? value : "",
    new m.mxGeometry(0, 0, width, height),
    style,
  );
  cell.geometry.setTerminalPoint(new m.mxPoint(0, height), true);
  cell.geometry.setTerminalPoint(new m.mxPoint(width, 0), false);
  cell.geometry.relative = true;
  cell.edge = true;

  return this.createEdgeTemplateFromCells(
    [cell],
    width,
    height,
    title,
    showLabel,
    allowCellsInserted,
  );
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplateFromCells = function (
  cells,
  width,
  height,
  title,
  showLabel,
  allowCellsInserted,
) {
  return this.createItem(
    cells,
    title,
    showLabel,
    true,
    width,
    height,
    allowCellsInserted,
  );
};

/**
 * Adds the given palette.
 */
Sidebar.prototype.addPaletteFunctions = function (id, title, expanded, fns) {
  this.addPalette(
    id,
    title,
    expanded,
    m.mxUtils.bind(this, function (content) {
      for (var i = 0; i < fns.length; i++) {
        content.appendChild(fns[i](content));
      }
    }),
  );
};

/**
 * Adds the given palette.
 */
Sidebar.prototype.addPalette = function (id, title, expanded, onInit) {
  var elt = this.createTitle(title);
  this.container.appendChild(elt);

  var div = document.createElement("div");
  div.className = "geSidebar";

  // Disables built-in pan and zoom in IE10 and later
  if (m.mxClient.IS_POINTER) {
    div.style.touchAction = "none";
  }

  if (expanded) {
    onInit(div);
    onInit = null;
  } else {
    div.style.display = "none";
  }

  this.addFoldingHandler(elt, div, onInit);

  var outer = document.createElement("div");
  outer.appendChild(div);
  this.container.appendChild(outer);

  // Keeps references to the DOM nodes
  if (id != null) {
    this.palettes[id] = [elt, outer];
  }

  return div;
};

/**
 * Create the given title element.
 */
Sidebar.prototype.addFoldingHandler = function (title, content, funct) {
  var initialized = false;

  // Avoids mixed content warning in IE6-8
  if (!m.mxClient.IS_IE || document.documentMode >= 8) {
    title.style.backgroundImage =
      content.style.display == "none"
        ? "url('" + this.collapsedImage + "')"
        : "url('" + this.expandedImage + "')";
  }

  title.style.backgroundRepeat = "no-repeat";
  title.style.backgroundPosition = "0% 50%";

  m.mxEvent.addListener(
    title,
    "click",
    m.mxUtils.bind(this, function (evt) {
      if (content.style.display == "none") {
        if (!initialized) {
          initialized = true;

          if (funct != null) {
            // Wait cursor does not show up on Mac
            title.style.cursor = "wait";
            var prev = title.innerHTML;
            title.innerHTML = m.mxResources.get("loading") + "...";

            window.setTimeout(
              function () {
                content.style.display = "block";
                title.style.cursor = "";
                title.innerHTML = prev;

                var fo = m.mxClient.NO_FO;
                m.mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
                funct(content, title);
                m.mxClient.NO_FO = fo;
              },
              m.mxClient.IS_FF ? 20 : 0,
            );
          } else {
            content.style.display = "block";
          }
        } else {
          content.style.display = "block";
        }

        title.style.backgroundImage = "url('" + this.expandedImage + "')";
      } else {
        title.style.backgroundImage = "url('" + this.collapsedImage + "')";
        content.style.display = "none";
      }

      m.mxEvent.consume(evt);
    }),
  );

  // Prevents focus
  if (!m.mxClient.IS_QUIRKS) {
    m.mxEvent.addListener(
      title,
      m.mxClient.IS_POINTER ? "pointerdown" : "mousedown",
      m.mxUtils.bind(this, function (evt) {
        evt.preventDefault();
      }),
    );
  }
};

/**
 * Removes the palette for the given ID.
 */
Sidebar.prototype.removePalette = function (id) {
  var elts = this.palettes[id];

  if (elts != null) {
    this.palettes[id] = null;

    for (var i = 0; i < elts.length; i++) {
      this.container.removeChild(elts[i]);
    }

    return true;
  }

  return false;
};

/**
 * Adds the given image palette.
 */
Sidebar.prototype.addImagePalette = function (
  id,
  title,
  prefix,
  postfix,
  items,
  titles,
  tags,
) {
  var showTitles = titles != null;
  var fns = [];

  for (var i = 0; i < items.length; i++) {
    m.mxUtils.bind(this, function (item, title, tmpTags) {
      if (tmpTags == null) {
        var slash = item.lastIndexOf("/");
        var dot = item.lastIndexOf(".");
        tmpTags = item
          .substring(slash >= 0 ? slash + 1 : 0, dot >= 0 ? dot : item.length)
          .replace(/[-_]/g, " ");
      }

      fns.push(
        this.createVertexTemplateEntry(
          "image;html=1;image=" + prefix + item + postfix,
          this.defaultImageWidth,
          this.defaultImageHeight,
          "",
          title,
          title != null,
          null,
          this.filterTags(tmpTags),
        ),
      );
    })(
      items[i],
      titles != null ? titles[i] : null,
      tags != null ? tags[items[i]] : null,
    );
  }

  this.addPaletteFunctions(id, title, false, fns);
};

/**
 * Creates the array of tags for the given stencil. Duplicates are allowed and will be filtered out later.
 */
Sidebar.prototype.getTagsForStencil = function (
  packageName,
  stencilName,
  moreTags,
) {
  var tags = packageName.split(".");

  for (var i = 1; i < tags.length; i++) {
    tags[i] = tags[i].replace(/_/g, " ");
  }

  tags.push(stencilName.replace(/_/g, " "));

  if (moreTags != null) {
    tags.push(moreTags);
  }

  return tags.slice(1, tags.length);
};

/**
 * Adds the given stencil palette.
 */
Sidebar.prototype.addStencilPalette = function (
  id,
  title,
  stencilFile,
  style,
  ignore,
  onInit,
  scale,
  tags,
  customFns,
  groupId,
) {
  scale = scale != null ? scale : 1;

  if (this.addStencilsToIndex) {
    // LATER: Handle asynchronous loading dependency
    var fns = [];

    if (customFns != null) {
      for (var i = 0; i < customFns.length; i++) {
        fns.push(customFns[i]);
      }
    }

    m.mxStencilRegistry.loadStencilSet(
      stencilFile,
      m.mxUtils.bind(
        this,
        function (packageName, stencilName, displayName, w, h) {
          if (ignore == null || m.mxUtils.indexOf(ignore, stencilName) < 0) {
            var tmp = this.getTagsForStencil(packageName, stencilName);
            var tmpTags = tags != null ? tags[stencilName] : null;

            if (tmpTags != null) {
              tmp.push(tmpTags);
            }

            fns.push(
              this.createVertexTemplateEntry(
                "shape=" + packageName + stencilName.toLowerCase() + style,
                Math.round(w * scale),
                Math.round(h * scale),
                "",
                stencilName.replace(/_/g, " "),
                null,
                null,
                this.filterTags(tmp.join(" ")),
              ),
            );
          }
        },
      ),
      true,
      true,
    );

    this.addPaletteFunctions(id, title, false, fns);
  } else {
    this.addPalette(
      id,
      title,
      false,
      m.mxUtils.bind(this, function (content) {
        if (style == null) {
          style = "";
        }

        if (onInit != null) {
          onInit.call(this, content);
        }

        if (customFns != null) {
          for (var i = 0; i < customFns.length; i++) {
            customFns[i](content);
          }
        }

        m.mxStencilRegistry.loadStencilSet(
          stencilFile,
          m.mxUtils.bind(
            this,
            function (packageName, stencilName, displayName, w, h) {
              if (
                ignore == null ||
                m.mxUtils.indexOf(ignore, stencilName) < 0
              ) {
                content.appendChild(
                  this.createVertexTemplate(
                    "shape=" + packageName + stencilName.toLowerCase() + style,
                    Math.round(w * scale),
                    Math.round(h * scale),
                    "",
                    stencilName.replace(/_/g, " "),
                    true,
                  ),
                );
              }
            },
          ),
          true,
        );
      }),
    );
  }
};

/**
 * Adds the given stencil palette.
 */
Sidebar.prototype.destroy = function () {
  if (this.graph != null) {
    if (
      this.graph.container != null &&
      this.graph.container.parentNode != null
    ) {
      this.graph.container.parentNode.removeChild(this.graph.container);
    }

    this.graph.destroy();
    this.graph = null;
  }

  if (this.pointerUpHandler != null) {
    m.mxEvent.removeListener(
      document,
      m.mxClient.IS_POINTER ? "pointerup" : "mouseup",
      this.pointerUpHandler,
    );
    this.pointerUpHandler = null;
  }

  if (this.pointerDownHandler != null) {
    m.mxEvent.removeListener(
      document,
      m.mxClient.IS_POINTER ? "pointerdown" : "mousedown",
      this.pointerDownHandler,
    );
    this.pointerDownHandler = null;
  }

  if (this.pointerMoveHandler != null) {
    m.mxEvent.removeListener(
      document,
      m.mxClient.IS_POINTER ? "pointermove" : "mousemove",
      this.pointerMoveHandler,
    );
    this.pointerMoveHandler = null;
  }

  if (this.pointerOutHandler != null) {
    m.mxEvent.removeListener(
      document,
      m.mxClient.IS_POINTER ? "pointerout" : "mouseout",
      this.pointerOutHandler,
    );
    this.pointerOutHandler = null;
  }
};
