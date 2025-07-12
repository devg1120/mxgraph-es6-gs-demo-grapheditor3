# Customize the styles of the split view

## Introduction

The split.panel.js uses CSS to control the styles of the view. All the names of the style classes are started with "-split-". The detail of the classes is described in the next section.
The default styles are predefined in "splitpanel.default.css". The user can use it directly.
The user can customize some or all of the classes to change the styles of the view.

The best practice of customize the styles is inheriting the default style and then defining the different details of the classes with a special custom CSS selector.

The follow example shows customizing one view with yellow background and the other with red background.
```html
<html>
<head>
    <link rel="stylesheet" href="splitpanel.default.css" />
    <script type="text/javascript" src="splitpanel.js"></script>
    <style>
        #container1.-split-container {
            background-color: yellow;
        }
        #container2.-split-container {
            background-color: red;
        }
    </style>
</head>
<body>
    <div id="container1" style="width:640px; height: 480px;">
        <div style="width: 320px;" d-split-auto="true">
            the 1-1 panel
        </div>
        <div style="min-width: 100px; width: 320px;">
            the 1-2 panel
        </div>
    </div>
    <div id="container2" style="width:640px; height: 480px;">
        <div style="width: 320px;" d-split-auto="true">
            the 2-1 panel
        </div>
        <div style="min-width: 100px; width: 320px;">
            the 2-2 panel
        </div>
    </div>
    <script type="text/javascript">
        SplitPanel.init(document.getElementById("container1"));
        SplitPanel.init(document.getElementById("container2"));
    </script>
</body>
</html>
```
NOTICE: if you want to inherit or overwrite the default style, you should embed the default CSS file before the custom style defining. And the "!important" keyword may be used to overwrite some styles.

## Predefined classes of the style
- **.-split-container**
  the common styles of the whole split view
- **.-split-container-horizontal**
  the special styles of the whole horizontal split view
- **.-split-container-vertical**
  the special styles of the whole vertical split view
- **.-split-panel**
  the common styles of a split panel
- **.-split-container-horizontal > .-split-panel**
  the special styles of a split panel in the horizontal split view
- **.-split-container-horizontal > .-split-panel[d-split-panel="0"]**
  the special styles of the first split panel in the horizontal split view,
  this classes is useful when the first needs some special styles like "margin".
- **.-split-container-vertical > .-split-panel**
  the special styles of a split panel in the vertical split view
- **.-split-container-vertical > .-split-panel[d-split-panel="0"]**
  the special styles of the first split panel in the vertical split view,
  this classes is useful when the first needs some special styles like "margin".
- **.-split-bar**
  the common styles of the split bar
- **.-split-bar:hover**
  the common styles of the split bar when hovering the mouse cursor over the split bar
- **.-split-bar:active**
  the common styles of the split bar when draging the split bar
- **.-split-bar:after**
  the common styles of the slide block of the split bar
- **.-split-container-horizontal > .-split-bar**
  the special styles of the split bar in the horizontal split view
- **.-split-container-horizontal > .-split-bar:after**
  the special styles of the slide block of the split bar in the horizontal split view
- **.-split-container-vertical > .-split-bar**
  the special styles of the split bar in the vertical split view
- **.-split-container-vertical > .-split-bar:after**
  the special styles of the slide block of the split bar in the vertical split view
  