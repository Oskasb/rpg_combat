"use strict";

define([
        'game/actions/AnimationSequencer'
    ],
    function(
        AnimationSequencer
    ) {

        var AnimationStateProcessor = function() {};

        var actionState;
        var key;
        var targetTime;

        AnimationStateProcessor.applyActionStateToGamePiece = function(action, gamePiece) {

            actionState = action.getActionState();

            if (actionState === ENUMS.ActionState.AVAILABLE) {
                return;
            }

            key = AnimationSequencer.getGamePieceActionStateKey(action, gamePiece);

            if (actionState === ENUMS.ActionState.ON_COOLDOWN) {
                targetTime = action.getActionRecoverTime();
                gamePiece.actionStateEnded(action);
                gamePiece.getPieceAnimator().setPoseKey(key);
            } else {
                targetTime = action.getActionTargetTime();
            }

            gamePiece.activatePieceAnimation(key, 1, 1/targetTime, targetTime)

        };


        AnimationStateProcessor.applyMovementStateToGamePiece = function(state, movement, gamePiece) {
            AnimationSequencer.sequenceLegAnimation(state, movement, gamePiece);
            AnimationSequencer.sequenceBodyAnimation(state, movement, gamePiece);

        };

        return AnimationStateProcessor;

    });

