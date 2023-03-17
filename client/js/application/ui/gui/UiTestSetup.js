"use strict";

define([
    'evt',
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
        evt,
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

        var tempVec1 = new THREE.Vector3();
        var tempVec2 = new THREE.Vector3();

        var testButtons = [];
        var progressBars = [];
        var textBoxes = [];
        var actionButtons = [];
        var thumbstick;
        var matrixText;
        var container;

        var statsButton;

        var actionPointStatus;

        var testUiActive = false;

        var UiTestSetup = function() {
            this.setupUiTestCallbacks();
        };

        UiTestSetup.prototype.setupUiTestCallbacks = function() {

            var addTextBox = function() {
                this.addTextBox();
            }.bind(this);

            var addProgressBar = function() {
                this.addProgressBar();
            }.bind(this);

            var addMatrixText = function(inputIndex) {
                this.addMatrixText(inputIndex);
            }.bind(this);

            var addThumbstick = function(inputIndex) {
                this.addThumbstick(inputIndex);
            }.bind(this);

            var addContainer = function(inputIndex) {
                this.addContainer(inputIndex);
            }.bind(this);

            var addActionButton = function(inputIndex) {
                this.addActionButton(inputIndex)
            }.bind(this);

            var addActionPointStatus = function(inputIndex) {
                this.addActionPointStatus(inputIndex)
            }.bind(this);

            var toggleTestUi = function(inputIndex) {
            //    console.log("Button: ", inputIndex);
                if (testUiActive) {
                    this.closeTestUi();
                } else {
                    this.openTestUi();
                }

            }.bind(this);

            this.callbacks = {
                toggleTestUi:toggleTestUi,
                addProgressBar:addProgressBar,
                addTextBox:addTextBox,
                addMatrixText:addMatrixText,
                addThumbstick:addThumbstick,
                addContainer:addContainer,
                addActionButton:addActionButton,
                addActionPointStatus:addActionPointStatus
            }

        };

        var mainButton;

        UiTestSetup.prototype.initUiTestSetup = function() {

            GuiAPI.printDebugText("INIT TEST UI");

            var buttonReady = function(button) {
                mainButton = button;

                setTimeout(function() {
                    mainButton.pressButtonFromCode()
                }, 0)
            };

            var testActive = function(widget) {
                return testUiActive;
            };

            var opts = GuiAPI.buildWidgetOptions(
                'button_big_blue',
                this.callbacks.toggleTestUi,
                testActive,
                true,
                'TESTS',
                -0.3,
                -0.05,
                'top_right'
            );

            GuiAPI.buildGuiWidget('GuiSimpleButton', opts, buttonReady);

            var statsReady = function(button) {
                statsButton = button;
            };

            var addStatsPanel = function() {
                DebugAPI.setDebugDrawStats(!DebugAPI.getDebugDrawStats(), statsButton)
            };

            opts = GuiAPI.buildWidgetOptions(
                'button_big_blue',
                addStatsPanel,
                DebugAPI.getDebugDrawStats,
                true,
                'STATS',
                -0.12,
                -0.05,
                'top_right'
            );


            GuiAPI.buildGuiWidget('GuiSimpleButton', opts, statsReady);

        };

        var addTopButton = function(text, onActivate, testActive) {

            var onReady = function(widget) {
                container.addChildWidgetToContainer(widget.guiWidget);
            };

            var opts = GuiAPI.buildWidgetOptions('button_big_blue', onActivate, testActive, true, text);

            GuiAPI.buildGuiWidget('GuiSimpleButton', opts, onReady);

        };


        UiTestSetup.prototype.addTestButtons = function() {

            this.addContainer();


            var spamActive = function() {
                return MainWorldAPI.getWorldSimulation().readWorldStatusValue('randomSpawn');
            };

            var spawnSpam = function() {
                var wstatus = MainWorldAPI.getWorldSimulation().getWorldStatus();
                wstatus.randomSpawn = !wstatus.randomSpawn
            };

            addTopButton('SPAWN', spawnSpam, spamActive);

            addTopButton('Prg Bar', this.callbacks.addProgressBar, null);
            addTopButton('txtbox', this.callbacks.addTextBox, null);

            var matrixActive = function() {
                if (matrixText) {
                    return true;
                }
            };

            addTopButton('MATRIX', this.callbacks.addMatrixText, matrixActive);

            var stickActive = function() {
                if (thumbstick) {
                    return true;
                }
            };

            addTopButton('STICK', this.callbacks.addThumbstick, stickActive);

            var abPresent = function() {
                if (actionButtons.length) {
                    return true;
                }
            };

            addTopButton('ACTION', this.callbacks.addActionButton, abPresent);

            var apsPresent = function() {
                if (actionPointStatus) {
                    return true;
                }
            };

            addTopButton('APS', this.callbacks.addActionPointStatus, apsPresent);


            addTopButton('PIECE', GameAPI.loadTestPiece, GameAPI.testPieceLoaded);



            var debugAnims = function() {
                GuiAPI.getGuiDebug().debugPieceAnimations(GameAPI.getPlayerCharacter())
            }

            addTopButton('ANIMS', debugAnims, GuiAPI.getGuiDebug().getDebugAnimChar);


            var envArgs = [];

            var env = 0;

            var advanceEnv = function() {
                envArgs[0] = env;
                envArgs[1] = 20;
                evt.fire(ENUMS.Event.ADVANCE_ENVIRONMENT, envArgs);
                env++;
                GuiAPI.printDebugText("STEP ENVIRONMENT "+env);
            };

            var dummy = function() {

            };

            addTopButton('STEPENV', advanceEnv, dummy);

            var dropItem = function() {
                GameAPI.dropCharacterItem(GameAPI.getPlayerCharacter());
            };


            addTopButton('DROPITEM', dropItem, dummy);


            var physDebug = function() {
                DebugAPI.setDebugDrawPhysics(!DebugAPI.getDebugDrawPhysics())
            };
            var physIsDebug = function() {
                return DebugAPI.getDebugDrawPhysics()
            };


            addTopButton('PHYS_DBG', physDebug, physIsDebug);


            var charDebug = function() {
                DebugAPI.setDebugDrawCharacters(!DebugAPI.getDebugDrawCharacters())
            };
            var charIsDebug = function() {
                return DebugAPI.getDebugDrawCharacters()
            };


            addTopButton('CHAR_DBG', charDebug, charIsDebug);



            var jntDebug = function() {
                DebugAPI.setDebugDrawJoints(!DebugAPI.getDebugDrawJoints())
            };
            var jntIsDebug = function() {
                return DebugAPI.getDebugDrawJoints()
            };



            addTopButton('JNT_DBG', jntDebug, jntIsDebug);

        };

        UiTestSetup.prototype.addProgressBar = function() {

            tempVec1.set(0.1, -0.2, 0);
            tempVec1.y += progressBars.length * 0.06;

            var progressBar = new GuiProgressBar();

            var onActivate = function(bool, widget) {
                if (bool) {
                    progressBar.deactivateProgressBar()
                } else {
                    progressBar.activateProgressBar()
                }
            };

            progressBar.initProgressBar('progress_indicator_big_red', onActivate, null, tempVec1);
            progressBars.push(progressBar);
        };


        UiTestSetup.prototype.addTextBox = function() {

            tempVec1.set(0.25, -0.3, 0);
            tempVec1.y += textBoxes.length * 0.14;

            var onReady = function(textBox) {
                textBox.updateTextContent("Text ready...")
                textBoxes.push(textBox);
            };

            var onActivate = function(inputIndex, widget) {
                widget.printWidgetText('pressed')
            };

            var opts = GuiAPI.buildWidgetOptions('main_text_box', onActivate, false, true, "TRY ME", tempVec1.x, tempVec1.y, false);

            GuiAPI.buildGuiWidget('GuiTextBox', opts, onReady);

        };


        UiTestSetup.prototype.addMatrixText = function(inputIndex) {

            if (!matrixText) {

                var onReady = function(ssTxt) {
                    tempVec1.set(-0.5, -0.5, 0);
                    tempVec2.set(1.0, 1.0, 0);

                    ssTxt.setTextDimensions(tempVec1, tempVec2);
                    ssTxt.activateScreenSpaceText()
                };

                matrixText = new GuiScreenSpaceText();

                matrixText.initScreenSpaceText(onReady);

            } else {
                if (matrixText) {
                    matrixText.removeGuiWidget();
                    matrixText = null
                }
            }

        };


        UiTestSetup.prototype.addThumbstick = function(inputIndex) {

            if (!thumbstick) {

                var onReady = function(tmbstick) {
                //    tempVec1.set(-0.22, -0.22, 0);

                //    tmbstick.setOriginPosition(tempVec1);
                //    tmbstick.guiWidget.attachToAnchor('bottom_left')


                };

                thumbstick = new GuiThumbstick();
                thumbstick.initThumbstick('widget_thumbstick', onReady);

            } else {
                if (thumbstick) {
                    thumbstick.removeGuiWidget();
                    thumbstick = null
                }
            }

        };

        UiTestSetup.prototype.addContainer = function(inputIndex) {


        //    console.log("Add Container", inputIndex);

            if (!container) {

                var onReady = function(widget) {
                    tempVec1.set(0.3, 0.33, 0);
                    widget.setPosition(tempVec1)
                    mainButton.guiWidget.addChild(widget);
                //    includeButton();
                };

                container = new GuiExpandingContainer();
                container.initExpandingContainer('widget_expanding_container', onReady);
            }
        };



        UiTestSetup.prototype.addActionButton = function(inputIndex) {




        //    console.log("Add Action Button", inputIndex);

            var attachAction = function(ab) {

            //    console.log("Attach Action Button action...", ab);
                ab.attachActionToButton(ab.getDummyAction());
            };

            var sticks = [
                new THREE.Vector3(-0.40, 0.08, 0),
                new THREE.Vector3(-0.39, 0.19, 0),
                new THREE.Vector3(-0.30, 0.28, 0),
                new THREE.Vector3(-0.19, 0.30, 0),
                new THREE.Vector3(-0.08, 0.31, 0)

            ];

            var count = 0;

            var addAB = function() {

                var onReady = function(widget) {

                    widget.offsetWidgetPosition(sticks[count])
                    count++;

                    attachAction(actionButton);
                };

                var actionButton = new GuiActionButton();
                actionButton.initActionButton('widget_action_button', onReady);
                actionButtons.push(actionButton);
            };

            if (!actionButtons.length) {

                addAB();
                addAB();
                addAB();
                addAB();
                addAB();

            } else {
                while (actionButtons.length) {
                    actionButtons.pop().removeGuiWidget();
                }
            }
        };

        var actionPointStatus;

        UiTestSetup.prototype.addActionPointStatus = function(inputIndex) {

            console.log("Add GuiActionPointStatus", inputIndex);

            var addApB = function() {

                var onReady = function(widget) {

                    actionPointStatus.setActionPointStatus(actionPointStatus.createDummyActionPointStatus(10));
                };

                actionPointStatus = new GuiActionPointStatus();
                actionPointStatus.initActionPointStatus('widget_action_point_container', onReady);
            };

            if (!actionPointStatus) {
                addApB();
            } else {
                actionPointStatus.removeGuiWidget();
                actionPointStatus = null;
            }
        };


        UiTestSetup.prototype.openTestUi = function() {
            testUiActive = true;

            this.addTestButtons();

        //    console.log("Open test Ui");
        };

        UiTestSetup.prototype.closeTestUi = function() {

            if (!testUiActive) {
                console.log("Not active");
                return;
            }

            testUiActive = false;

            while (progressBars.length) {
                progressBars.pop().removeGuiWidget();
            }

            while (textBoxes.length) {
                textBoxes.pop().removeGuiWidget();
            }

            if (matrixText) {
                matrixText.removeGuiWidget();
                matrixText = null
            }

            if (container) {
                container.removeGuiWidget();
                container = null
            }

        };



        return UiTestSetup;

    });