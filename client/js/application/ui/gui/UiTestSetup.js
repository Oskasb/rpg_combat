import {GuiStatsPanel} from "./widgets/GuiStatsPanel.js";
import {GuiActionButton} from "./widgets/GuiActionButton.js";
import {GuiSimpleButton} from "./widgets/GuiSimpleButton.js";
import {GuiExpandingContainer} from "./widgets/GuiExpandingContainer.js";
import {GuiThumbstick} from "./widgets/GuiThumbstick.js";
import {GuiTextBox} from "./widgets/GuiTextBox.js";
import {GuiScreenSpaceText} from "./widgets/GuiScreenSpaceText.js";
import {GuiProgressBar} from "./widgets/GuiProgressBar.js";

class UiTestSetup {
    constructor() {

        this.thumbstick;
        this.matrixText;
        this.container;
        this.statsButton;
        this.mainButton;

        this.tempVec1 = new THREE.Vector3();
        this.tempVec2 = new THREE.Vector3();
        this.progressBars = [];
        this.textBoxes = [];
        this.actionButtons = [];
        this.testUiActive = false;
        this.setupUiTestCallbacks();

        };

        setupUiTestCallbacks = function() {

            var addTextBox = function() {
                this.addTextBox();
            }.bind(this);

            var addProgressBar = function() {
                this.addProgressBar();
            }.bind(this);

            var addMatrixText = function() {
                this.addMatrixText();
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
                if (this.testUiActive) {
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



        initUiTestSetup = function() {

            GuiAPI.printDebugText("INIT TEST UI");

            var buttonReady = function(button) {
                this.mainButton = button;

                setTimeout(function() {
                    button.pressButtonFromCode()
                }, 0)
            }.bind(this)

            var testActive = function(widget) {
                return this.testUiActive;
            }.bind(this);

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

            /*
            var statsReady = function(button) {
                this.statsButton = button;
            }.bind(this);

            var addStatsPanel = function() {
                this.debugAPI.setDebugDrawStats(!this.debugAPI.getDebugDrawStats(), this.statsButton)
            }.bind(this);

            opts = GuiAPI.buildWidgetOptions(
                'button_big_blue',
                addStatsPanel,
                this.debugAPI.getDebugDrawStats,
                true,
                'STATS',
                -0.12,
                -0.05,
                'top_right'
            );


            GuiAPI.buildGuiWidget('GuiSimpleButton', opts, statsReady);
*/
        };




        addTestButtons = function() {


            let addTopButton = function(text, onActivate, testActive) {

                let container = this.container;

                var onReady = function(widget) {
                    container.addChildWidgetToContainer(widget.guiWidget);
                };

                var opts = GuiAPI.buildWidgetOptions('button_big_blue', onActivate, testActive, true, text);

                GuiAPI.buildGuiWidget('GuiSimpleButton', opts, onReady);

            }.bind(this)

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
                if (this.matrixText) {
                    return true;
                }
            }.bind(this);

            addTopButton('MATRIX', this.callbacks.addMatrixText, matrixActive);

            var stickActive = function() {
                if (this.thumbstick) {
                    return true;
                }
            };

            addTopButton('STICK', this.callbacks.addThumbstick, stickActive);

            var abPresent = function() {
                if (this.actionButtons.length) {
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


    //        addTopButton('PIECE', GameAPI.loadTestPiece, GameAPI.testPieceLoaded);



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

            return;

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

        addProgressBar = function() {

            this.tempVec1.set(0.1, -0.2, 0);
            this.tempVec1.y += this.progressBars.length * 0.06;

            var progressBar = new GuiProgressBar();

            var onActivate = function(bool, widget) {
                if (bool) {
                    progressBar.deactivateProgressBar()
                } else {
                    progressBar.activateProgressBar()
                }
            };

            progressBar.initProgressBar('progress_indicator_big_red', onActivate, null, this.tempVec1);
            this.progressBars.push(progressBar);
        };


        addTextBox = function() {

            this.tempVec1.set(0.25, -0.3, 0);
            this.tempVec1.y += this.textBoxes.length * 0.14;

            var onReady = function(textBox) {
                textBox.updateTextContent("Text ready...")
                this.textBoxes.push(textBox);
            };

            var onActivate = function(inputIndex, widget) {
                widget.printWidgetText('pressed')
            };

            var opts = GuiAPI.buildWidgetOptions('main_text_box', onActivate, false, true, "TRY ME", tempVec1.x, tempVec1.y, false);

            GuiAPI.buildGuiWidget('GuiTextBox', opts, onReady);

        };


        addMatrixText = function() {

            if (!this.matrixText) {

                var onReady = function(ssTxt) {
                    this.tempVec1.set(-0.5, -0.5, 0);
                    this.tempVec2.set(1.0, 1.0, 0);

                    ssTxt.setTextDimensions(this.tempVec1, this.tempVec2);
                    ssTxt.activateScreenSpaceText();
                    ssTxt.updateTextContent('screenspace text....')
                }.bind(this);

                this.matrixText = new GuiScreenSpaceText();

                this.matrixText.initScreenSpaceText(onReady);

            } else {
                if (this.matrixText) {
                    this.matrixText.removeGuiWidget();
                    this.matrixText = null
                }
            }

        };


        addThumbstick = function(inputIndex) {

            if (!this.thumbstick) {

                var onReady = function(tmbstick) {
                //    tempVec1.set(-0.22, -0.22, 0);

                //    tmbstick.setOriginPosition(tempVec1);
                //    tmbstick.guiWidget.attachToAnchor('bottom_left')


                };

                this.thumbstick = new GuiThumbstick();
                this.thumbstick.initThumbstick('widget_thumbstick', onReady);

            } else {
                if (this.thumbstick) {
                    this.thumbstick.removeGuiWidget();
                    this.thumbstick = null
                }
            }

        };

        addContainer = function(inputIndex) {


        //    console.log("Add Container", inputIndex);

            if (!this.container) {

                var onReady = function(widget) {
                    this.tempVec1.set(0.3, 0.33, 0);
                    widget.setPosition(this.tempVec1)
                    this.mainButton.guiWidget.addChild(widget);
                //    includeButton();
                }.bind(this);

                this.container = new GuiExpandingContainer();
                this.container.initExpandingContainer('widget_expanding_container', onReady);
            }
        };



        addActionButton = function(inputIndex) {




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
                this.actionButtons.push(actionButton);
            };

            if (!this.actionButtons.length) {

                addAB();
                addAB();
                addAB();
                addAB();
                addAB();

            } else {
                while (this.actionButtons.length) {
                    this.actionButtons.pop().removeGuiWidget();
                }
            }
        };



        addActionPointStatus = function(inputIndex) {

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


        openTestUi = function() {
            this.testUiActive = true;

            this.addTestButtons();

            console.log("Open test Ui");
        };

        closeTestUi = function() {

            if (!this.testUiActive) {
                console.log("Not active");
                return;
            }

            this.testUiActive = false;

            while (this.progressBars.length) {
                this.progressBars.pop().removeGuiWidget();
            }

            while (this.textBoxes.length) {
                this.textBoxes.pop().removeGuiWidget();
            }

            if (this.matrixText) {
                this.matrixText.removeGuiWidget();
                this.matrixText = null
            }

            if (this.container) {
                this.container.removeGuiWidget();
                this.container = null
            }

        };


    }

export {UiTestSetup}