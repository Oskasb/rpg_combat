"use strict";

define([
        'client/js/workers/main/ui/elements/GuiWidget',
        'ui/widgets/GuiStatsPanel',
        'ui/widgets/GuiActionPointStatus',
        'ui/widgets/GuiActionButton',
        'ui/widgets/GuiSimpleButton',
        'ui/widgets/GuiExpandingContainer',
        'ui/widgets/GuiThumbstick',
        'ui/widgets/GuiTextBox',
        'ui/widgets/GuiScreenSpaceText',
        'ui/widgets/GuiProgressBar'
    ],
    function(
        GuiWidget,
        GuiStatsPanel,
        GuiActionPointStatus,
        GuiActionButton,
        GuiSimpleButton,
        GuiExpandingContainer,
        GuiThumbstick,
        GuiTextBox,
        GuiScreenSpaceText,
        GuiProgressBar
    ) {

        var widgets = {
            GuiStatsPanel           : GuiStatsPanel                      ,
            GuiActionPointStatus    : GuiActionPointStatus               ,
            GuiActionButton         : GuiActionButton                    ,
            GuiSimpleButton         : GuiSimpleButton                    ,
            GuiExpandingContainer   : GuiExpandingContainer              ,
            GuiThumbstick           : GuiThumbstick                      ,
            GuiTextBox              : GuiTextBox                         ,
            GuiScreenSpaceText      : GuiScreenSpaceText                 ,
            GuiProgressBar          : GuiProgressBar
        };

        var WidgetBuilder = function() {

        };

        WidgetBuilder.prototype.buildWidget = function(widgetClassName, options, onReady) {
            var widgetOfClass = new widgets[widgetClassName](options);
            this.setupWidgetFromOptions(widgetOfClass, onReady);

        };

        WidgetBuilder.prototype.setupWidgetFromOptions = function(widgetOfClass, onReady) {

            var guiWidget = new GuiWidget(widgetOfClass.options.configId);

            var wReady = function(widget) {

                widget.applyWidgetOptions(widgetOfClass.options);
                widgetOfClass.setGuiWidget(widget);
                onReady(widgetOfClass)

            };

            guiWidget.initGuiWidget(null, wReady);

        };



        return WidgetBuilder;

    });