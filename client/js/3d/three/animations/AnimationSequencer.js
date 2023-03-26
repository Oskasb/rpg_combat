"use strict";

define([

    ],
    function(

    ) {

        var actionStateMap = {};
        actionStateMap[ENUMS.ActionState.ACTIVATING]     = 'prep';
        actionStateMap[ENUMS.ActionState.ACTIVE]         = 'exec';
        actionStateMap[ENUMS.ActionState.ON_COOLDOWN]    = 'end';
        //    actionStateMap[ENUMS.ActionState.AVAILABLE]      = 'end';

        var AnimationSequencer = function() {

        };

        var actionMap;
        var animKeys;
        var actionState;
        var key;
        var targetTime;

        AnimationSequencer.getGamePieceActionStateKey = function(action, gamePiece) {

            actionState = action.getActionState();

            actionMap = gamePiece.getPieceAnimator().getActionMap(action.getActionType());

            animKeys = actionMap[actionStateMap[actionState]];
            if (!animKeys) {
                GuiAPI.printDebugText("NO ANIM KEY "+action.getActionType()+" "+actionState);
                //    console.log("No Keys", action.getActionState(), actionStateMap, actionMap)
                return;
            }
            key = MATH.getRandomArrayEntry(animKeys);

            return key;
        };


        var moveStateMap = {};
        moveStateMap[ENUMS.CharacterState.COMBAT] = 'WALK_COMBAT';
        moveStateMap[ENUMS.CharacterState.IDLE] = 'WALK';

        var stationaryStateMap = {};
        stationaryStateMap[ENUMS.CharacterState.COMBAT] = 'GD_RT_FF';
        stationaryStateMap[ENUMS.CharacterState.IDLE] = 'IDLE';


        var bodyIdleMap = {};
        bodyIdleMap[ENUMS.CharacterState.COMBAT] = 'GD_RT_FF';
        bodyIdleMap[ENUMS.CharacterState.IDLE] = 'IDLE';

        var speedRefMap = {};
        speedRefMap[ENUMS.CharacterState.COMBAT] = 'walk_combat_speed';
        speedRefMap[ENUMS.CharacterState.IDLE] = 'walk_cycle_speed';


        var speed;
        var animRefSpeed = 1;


        AnimationSequencer.sequenceLegAnimation = function(state, movement, gamePiece) {

            speed = movement.getMovementSpeed();

            if (speed) {
                key = moveStateMap[state] ;
                animRefSpeed = movement.readConfig(speedRefMap[state]);
            } else {
                key = stationaryStateMap[state];
                speed = 1;
                animRefSpeed = 1;
            }

            gamePiece.activatePieceAnimation(key, 1, speed / animRefSpeed, 1)
        };

        var combatMoveIdles = ['GD_SID_R', 'GD_MID_R', 'GD_HNG_R', 'GD_HI_R'];
        var combatIdles = ['GD_SID_R', 'GD_MID_R', 'GD_BCK_R', 'GD_HNG_R', 'GD_INS_R', 'GD_HI_R'];

        var peaceMoveIdle = ['WALK_BODY'];
        var peaceIdle = ['GD_BCK_R'];

        var animator;

        var poseTimeLimit = 1.3;

        AnimationSequencer.sequenceBodyAnimation = function(state, movement, gamePiece) {

            if (gamePiece.activeActions.length === 0) {

                animator = gamePiece.getPieceAnimator();

                if (animator.getTimeAtKey() < poseTimeLimit) {
                    return;
                }

                speed = movement.getMovementSpeed();

                if (state === ENUMS.CharacterState.IDLE) {

                    if (speed) {
                        key = MATH.getRandomArrayEntry(peaceMoveIdle);
                        gamePiece.activatePieceAnimation(key, 1, 1, 0.25)
                    } else {
                        key = MATH.getRandomArrayEntry(peaceIdle);
                        gamePiece.activatePieceAnimation(key, 1, 1, 0.25)
                    }

                } else {

                    if (speed) {
                        key =  MATH.getRandomArrayEntry(combatMoveIdles);
                    } else {
                        key = MATH.getRandomArrayEntry(combatIdles);
                    }

                    gamePiece.activatePieceAnimation(key, 1, 1, 0.25);

                }

                animator.setPoseKey(key);

            }

        };

        return AnimationSequencer;

    });

